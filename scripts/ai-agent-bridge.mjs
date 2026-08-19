import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';

const HOST = process.env.AI_AGENT_BRIDGE_HOST || '127.0.0.1';
const PORT = Number(process.env.AI_AGENT_BRIDGE_PORT || 8787);
const PROVIDER_BASE_URL = (process.env.AI_AGENT_PROVIDER_BASE_URL || 'https://api.zzzcoding.org/v1').replace(/\/+$/, '');
const DEFAULT_MODEL = process.env.AI_AGENT_MODEL || 'gpt-5.6-sol';
const CODEX_BIN = process.env.CODEX_BIN || 'codex';
const REQUEST_TIMEOUT_MS = Number(process.env.AI_AGENT_TIMEOUT_MS || 180000);
const BUILD_TIMEOUT_MS = Number(process.env.AI_AGENT_BUILD_TIMEOUT_MS || 180000);
const MAX_BODY_BYTES = Number(process.env.AI_AGENT_MAX_BODY_BYTES || 1_000_000);
const API_KEY = process.env.ZZZCODING_API_KEY || process.env.OPENAI_API_KEY || '';
const PROJECT_ROOT = resolve(process.env.AI_AGENT_PROJECT_ROOT || process.cwd());
const NEWS_DIR = join(PROJECT_ROOT, 'src/content/news');
const ENABLE_GIT_PUBLISH = process.env.AI_AGENT_ENABLE_GIT_PUBLISH === '1';
const PUBLISH_TOKEN = process.env.AI_AGENT_PUBLISH_TOKEN || '';
const ALLOWED_ORIGINS = new Set(
  (process.env.AI_AGENT_ALLOWED_ORIGINS || 'http://localhost:4321,http://127.0.0.1:4321,https://chenyuqing.github.io')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const NEWS_CATEGORIES = ['模型与智能体', '工具与应用', '机器人与硬件', '商业与生态', '安全与评测'];
const STANDARD_NEWS_TAGS = [
  '大模型', '多智能体', 'AI编程', 'AI设计', '具身智能', '人形机器人', 'AI芯片', 'AI基础设施',
  '资本市场', '产业落地', '开源生态', 'AI安全', '评测基准', '世界模型', '自动驾驶',
];

if (!API_KEY) {
  console.error('Missing ZZZCODING_API_KEY (or OPENAI_API_KEY).');
  process.exit(1);
}
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error(`Invalid AI_AGENT_BRIDGE_PORT: ${PORT}`);
  process.exit(1);
}
if (!existsSync(NEWS_DIR)) {
  console.error(`News collection directory not found: ${NEWS_DIR}`);
  process.exit(1);
}
if (ENABLE_GIT_PUBLISH && !PUBLISH_TOKEN) {
  console.error('AI_AGENT_ENABLE_GIT_PUBLISH=1 requires AI_AGENT_PUBLISH_TOKEN.');
  process.exit(1);
}

const runtimeRoot = mkdtempSync(join(tmpdir(), 'chenyuqing-agent-bridge-'));
const codexHome = join(runtimeRoot, 'codex-home');
const codexWorkdir = join(runtimeRoot, 'workspace');
mkdirSync(codexHome, { recursive: true });
mkdirSync(codexWorkdir, { recursive: true });

writeFileSync(join(codexHome, 'config.toml'), `model_provider = "custom"
model = ${JSON.stringify(DEFAULT_MODEL)}
preferred_auth_method = "apikey"
model_reasoning_effort = "none"
disable_response_storage = true

[model_providers.custom]
name = "custom"
wire_api = "responses"
requires_openai_auth = true
base_url = ${JSON.stringify(PROVIDER_BASE_URL)}
`);
writeFileSync(join(codexHome, 'auth.json'), JSON.stringify({ OPENAI_API_KEY: API_KEY }));
chmodSync(join(codexHome, 'auth.json'), 0o600);

const newsDraftSchemaPath = join(runtimeRoot, 'news-draft-schema.json');
writeFileSync(newsDraftSchemaPath, JSON.stringify({
  type: 'object',
  additionalProperties: false,
  required: [
    'verificationStatus', 'blockedReason', 'slug', 'title', 'link', 'category', 'description', 'pubDate', 'tags',
    'body', 'sourceUrls', 'verificationNotes',
  ],
  properties: {
    verificationStatus: { type: 'string', enum: ['verified', 'blocked'] },
    blockedReason: { type: 'string' },
    slug: { type: 'string' },
    title: { type: 'string' },
    link: { type: 'string' },
    category: { type: 'string', enum: NEWS_CATEGORIES },
    description: { type: 'string' },
    pubDate: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    body: { type: 'string' },
    sourceUrls: { type: 'array', items: { type: 'string' } },
    verificationNotes: { type: 'array', items: { type: 'string' } },
  },
}, null, 2));

let closing = false;
const cleanup = () => {
  if (closing) return;
  closing = true;
  try {
    rmSync(runtimeRoot, { recursive: true, force: true });
  } catch {}
};
process.once('exit', cleanup);
process.once('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.once('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

const corsHeaders = (origin) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Private-Network': 'true',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
};

const sendJson = (res, status, payload, origin) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...corsHeaders(origin),
  });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) => new Promise((resolveBody, reject) => {
  const chunks = [];
  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf8');
      resolveBody(raw ? JSON.parse(raw) : {});
    } catch {
      reject(Object.assign(new Error('Request body must be valid JSON.'), { statusCode: 400 }));
    }
  });
  req.on('error', reject);
});

const contentToText = (content) => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.text || item.content || '';
      return '';
    })
    .filter(Boolean)
    .join('\n');
};

const messagesToPrompt = (messages) => {
  const roleLabels = { system: 'SYSTEM', user: 'USER', assistant: 'ASSISTANT' };
  const transcript = messages
    .filter((message) => message && typeof message === 'object')
    .map((message) => {
      const role = roleLabels[message.role] || String(message.role || 'USER').toUpperCase();
      return `${role}:\n${contentToText(message.content)}`;
    })
    .filter((part) => part.trim())
    .join('\n\n');

  return `${transcript}\n\nReturn only the assistant answer to the final user request. Do not describe tools, hidden reasoning, or this transcript format.`;
};

const runProcess = (command, args, { cwd, env = process.env, input = '', timeoutMs = REQUEST_TIMEOUT_MS } = {}) => new Promise((resolveProcess, reject) => {
  const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  let settled = false;

  const finish = (callback) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    callback();
  };

  child.stdout.on('data', (chunk) => {
    stdout = (stdout + chunk.toString()).slice(-64_000);
  });
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk.toString()).slice(-64_000);
  });
  child.on('error', (error) => {
    finish(() => reject(Object.assign(new Error(`Failed to start ${command}: ${error.message}`), { statusCode: 502 })));
  });
  child.on('close', (code) => {
    finish(() => resolveProcess({ code, stdout, stderr }));
  });

  const timer = setTimeout(() => {
    child.kill('SIGTERM');
    finish(() => reject(Object.assign(new Error(`${command} timed out.`), { statusCode: 504 })));
  }, timeoutMs);

  child.stdin.end(input);
});

const runCodexPrompt = async ({ model, prompt, search = false, outputSchemaPath = '' }) => {
  const outputPath = join(runtimeRoot, `response-${randomUUID()}.txt`);
  const args = [];
  if (search) args.push('--search');
  args.push(
    'exec', '--ephemeral', '--skip-git-repo-check', '--ignore-rules', '--sandbox', 'read-only', '--color', 'never',
    '-C', codexWorkdir, '-m', model, '--output-last-message', outputPath,
  );
  if (outputSchemaPath) args.push('--output-schema', outputSchemaPath);
  args.push('-');

  const result = await runProcess(CODEX_BIN, args, {
    cwd: codexWorkdir,
    env: { ...process.env, CODEX_HOME: codexHome },
    input: prompt,
  });

  if (result.code !== 0) {
    try { unlinkSync(outputPath); } catch {}
    throw Object.assign(new Error(`Codex CLI exited with code ${result.code}. ${result.stderr.slice(-1600)}`), { statusCode: 502 });
  }

  try {
    const answer = readFileSync(outputPath, 'utf8').trim();
    unlinkSync(outputPath);
    if (!answer) throw new Error(`Codex CLI returned an empty answer. ${result.stdout.slice(-500)}`);
    return answer;
  } catch (error) {
    throw Object.assign(new Error(`Unable to read Codex output: ${error.message}`), { statusCode: 502 });
  }
};

const runCodex = ({ model, messages }) => runCodexPrompt({ model, prompt: messagesToPrompt(messages) });

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const runCodexPromptWithTransientRetry = async (options) => {
  try {
    return await runCodexPrompt(options);
  } catch (error) {
    if (!/429|Too Many Requests|exceeded retry limit/i.test(error?.message || '')) throw error;
    await delay(12000);
    try {
      return await runCodexPrompt(options);
    } catch (retryError) {
      if (/429|Too Many Requests|exceeded retry limit/i.test(retryError?.message || '')) {
        retryError.statusCode = 429;
        retryError.message = `Provider rate limit is still active after one delayed retry. ${retryError.message}`;
      }
      throw retryError;
    }
  }
};

const shanghaiDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const validHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const publicSourceUrl = (value) => {
  if (!validHttpUrl(value)) return false;
  const hostname = new URL(value).hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname === '::1') return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
  const private172 = hostname.match(/^172\.(\d+)\./);
  if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return false;
  return true;
};

const decodeHtml = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const htmlToText = (html) => decodeHtml(html)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const sourceDateToIso = (value) => {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return '';
  const months = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03', apr: '04', april: '04',
    may: '05', jun: '06', june: '06', jul: '07', july: '07', aug: '08', august: '08', sep: '09', sept: '09',
    september: '09', oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
  };
  const month = months[match[1].toLowerCase()];
  if (!month) return '';
  return `${match[3]}-${month}-${String(match[2]).padStart(2, '0')}`;
};

const sourcePublishedDate = (text) => {
  const patterns = [
    /Published Time:\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i,
    /(?:^|\s)Date\s+([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i,
    /datePublished["']?\s*[:=]\s*["'](\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pattern of patterns) {
    const match = String(text).match(pattern);
    if (!match) continue;
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(match[1]) ? match[1] : sourceDateToIso(match[1]);
    if (iso) return iso;
  }
  return '';
};

const fetchSourceDocument = async (sourceUrl) => {
  if (!publicSourceUrl(sourceUrl)) {
    throw Object.assign(new Error(`Source URL is not allowed: ${sourceUrl}`), { statusCode: 400 });
  }

  const requestSource = (url) => fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.1',
      'User-Agent': 'chenyuqing-news-draft-bridge/1.0',
    },
  });

  let response = await requestSource(sourceUrl);
  let usedTextProxy = false;
  if (!response.ok) {
    response = await requestSource(`https://r.jina.ai/${sourceUrl}`);
    usedTextProxy = true;
  }
  if (!response.ok) {
    throw Object.assign(new Error(`Unable to fetch source ${sourceUrl}: HTTP ${response.status}`), { statusCode: 422 });
  }
  if (!usedTextProxy && !publicSourceUrl(response.url)) {
    throw Object.assign(new Error(`Source redirected to a disallowed URL: ${response.url}`), { statusCode: 400 });
  }

  const contentType = response.headers.get('content-type') || '';
  const raw = (await response.text()).slice(0, 1_500_000);
  const text = /html|xhtml/i.test(contentType) ? htmlToText(raw) : raw.replace(/\s+/g, ' ').trim();
  if (usedTextProxy && /Target URL returned error 404|Title:\s*404\b/i.test(text)) {
    throw Object.assign(new Error(`Source URL was not found: ${sourceUrl}`), { statusCode: 422 });
  }
  if (text.length < 120) {
    throw Object.assign(new Error(`Source content is too short to verify: ${sourceUrl}`), { statusCode: 422 });
  }
  return {
    url: sourceUrl,
    text: text.slice(0, 30_000),
    fetchedVia: usedTextProxy ? 'text-proxy' : 'direct',
    publishedDate: sourcePublishedDate(text),
  };
};

const sourceUrlsFromBrief = (brief) => [...new Set(
  (String(brief).match(/https?:\/\/[^\s<>"')\]]+/g) || []).map((url) => url.replace(/[.,，。；;]+$/, '')),
)].filter(publicSourceUrl).slice(0, 5);

const LATEST_NEWS_FEEDS = [
  {
    name: 'OpenAI News',
    url: 'https://openai.com/news/rss.xml',
    include: () => true,
  },
  {
    name: 'GitHub Changelog',
    url: 'https://github.blog/changelog/feed/',
    include: (title) => /\b(ai|copilot|agent|model|gpt|claude|gemini|grok)\b/i.test(title),
  },
];

const xmlValue = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
  if (!match) return '';
  return decodeHtml(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const discoverLatestNewsSource = async () => {
  const settled = await Promise.allSettled(LATEST_NEWS_FEEDS.map(async (feed) => {
    const response = await fetch(feed.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
      headers: {
        Accept: 'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.1',
        'User-Agent': 'chenyuqing-news-draft-bridge/1.0',
      },
    });
    if (!response.ok) throw new Error(`${feed.name} returned HTTP ${response.status}.`);
    const xml = (await response.text()).slice(0, 2_000_000);
    return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].flatMap((match) => {
      const title = xmlValue(match[1], 'title');
      const link = xmlValue(match[1], 'link');
      const rawDate = xmlValue(match[1], 'pubDate');
      const timestamp = Date.parse(rawDate);
      if (!title || !publicSourceUrl(link) || !Number.isFinite(timestamp) || !feed.include(title)) return [];
      const pubDate = new Date(timestamp).toISOString().slice(0, 10);
      if (pubDate > shanghaiDate()) return [];
      return [{ title, link, pubDate, timestamp, source: feed.name }];
    });
  }));

  const candidates = settled
    .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
    .filter((item) => !duplicateNews({ title: '', link: item.link }))
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!candidates.length) {
    const failures = settled
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason?.message || String(result.reason));
    throw Object.assign(new Error(`No new AI item was found in the official preset feeds.${failures.length ? ` Feed errors: ${failures.join(' ')}` : ''}`), { statusCode: 409 });
  }
  return candidates[0];
};

const normalizeSlug = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

const currentNewsTags = () => {
  const tags = new Set(STANDARD_NEWS_TAGS);
  for (const file of readdirSync(NEWS_DIR).filter((name) => name.endsWith('.md'))) {
    const content = readFileSync(join(NEWS_DIR, file), 'utf8');
    const match = content.match(/^tags:\s*\[(.*)\]\s*$/m);
    if (!match) continue;
    try {
      for (const tag of JSON.parse(`[${match[1]}]`)) tags.add(String(tag));
    } catch {}
  }
  return [...tags].sort();
};

const duplicateNews = ({ title, link }) => {
  for (const file of readdirSync(NEWS_DIR).filter((name) => name.endsWith('.md'))) {
    const content = readFileSync(join(NEWS_DIR, file), 'utf8');
    const titleMatch = content.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1];
    const linkMatch = content.match(/^link:\s*["']?(.*?)["']?\s*$/m)?.[1];
    if ((titleMatch && titleMatch === title) || (linkMatch && linkMatch === link)) return file;
  }
  return '';
};

const validateNewsDraft = (draft) => {
  const errors = [];
  const allowedTags = new Set(currentNewsTags());
  const slug = normalizeSlug(draft.slug);
  const tags = [...new Set((Array.isArray(draft.tags) ? draft.tags : []).map((tag) => String(tag).trim()).filter(Boolean))];
  const sourceUrls = [...new Set((Array.isArray(draft.sourceUrls) ? draft.sourceUrls : []).map(String).filter(validHttpUrl))];

  if (draft.verificationStatus !== 'verified') errors.push(draft.blockedReason || 'The model could not verify the news item.');
  if (!slug || slug.length < 6) errors.push('slug must be an English kebab-case identifier of at least 6 characters.');
  if (!String(draft.title || '').trim()) errors.push('title is required.');
  if (!validHttpUrl(draft.link)) errors.push('link must be a valid HTTP(S) URL.');
  if (!NEWS_CATEGORIES.includes(draft.category)) errors.push('category is invalid.');
  if (!String(draft.description || '').trim()) errors.push('description is required.');
  const pubDate = String(draft.pubDate || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pubDate) || Number.isNaN(new Date(`${pubDate}T00:00:00Z`).getTime())) errors.push('pubDate must be YYYY-MM-DD.');
  if (pubDate > shanghaiDate()) errors.push('pubDate cannot be in the future.');
  if (tags.length < 2 || tags.length > 3) errors.push('tags must contain 2-3 unique values.');
  if (tags.some((tag) => !allowedTags.has(tag))) errors.push(`Unsupported tags: ${tags.filter((tag) => !allowedTags.has(tag)).join(', ')}`);
  if (String(draft.body || '').trim().length < 120) errors.push('body is too short.');
  if (sourceUrls.length < 1) errors.push('At least one verified source URL is required.');
  if (!sourceUrls.includes(draft.link)) sourceUrls.unshift(draft.link);

  return {
    errors,
    normalized: {
      slug,
      title: String(draft.title || '').trim(),
      link: String(draft.link || '').trim(),
      category: draft.category,
      description: String(draft.description || '').trim(),
      pubDate,
      tags,
      body: String(draft.body || '').trim(),
      sourceUrls,
      verificationNotes: Array.isArray(draft.verificationNotes) ? draft.verificationNotes.map(String).filter(Boolean) : [],
    },
  };
};

const newsMarkdown = (draft, isDraft) => {
  const sourceSection = draft.sourceUrls.length
    ? `\n\n## 来源\n\n${draft.sourceUrls.map((url) => `- ${url}`).join('\n')}`
    : '';
  return `---\ntitle: ${JSON.stringify(draft.title)}\nlink: ${JSON.stringify(draft.link)}\ncategory: ${JSON.stringify(draft.category)}\ndescription: ${JSON.stringify(draft.description)}\npubDate: ${draft.pubDate}\ntags: ${JSON.stringify(draft.tags)}\ndraft: ${isDraft ? 'true' : 'false'}\n---\n\n${draft.body}${sourceSection}\n`;
};

const runBuild = async () => {
  const result = await runProcess('npm', ['run', 'build'], { cwd: PROJECT_ROOT, timeoutMs: BUILD_TIMEOUT_MS });
  if (result.code !== 0) {
    throw Object.assign(new Error(`npm run build failed. ${result.stderr.slice(-2400)}\n${result.stdout.slice(-1200)}`), { statusCode: 422 });
  }
  return result;
};

const generateNewsDraft = async ({ brief, model, force = false, primaryPublishedDate = '' }) => {
  const today = shanghaiDate();
  if (primaryPublishedDate && (!/^\d{4}-\d{2}-\d{2}$/.test(primaryPublishedDate) || primaryPublishedDate > today)) {
    throw Object.assign(new Error('primaryPublishedDate must be a non-future YYYY-MM-DD date.'), { statusCode: 400 });
  }
  const tags = currentNewsTags();
  const requestedSourceUrls = sourceUrlsFromBrief(brief);
  const sourceDocuments = [];
  for (const sourceUrl of requestedSourceUrls) {
    sourceDocuments.push(await fetchSourceDocument(sourceUrl));
  }
  if (primaryPublishedDate && sourceDocuments[0]) {
    sourceDocuments[0].publishedDate = primaryPublishedDate;
  }
  const sourceMaterial = sourceDocuments.length
    ? sourceDocuments.map((source, index) => `SOURCE ${index + 1}: ${source.url}\nPRIMARY PUBLICATION DATE: ${source.publishedDate || 'not found'}\n${source.text}`).join('\n\n')
    : 'No source documents were supplied. Live search must succeed or verificationStatus must be blocked.';
  const researchInstruction = sourceDocuments.length
    ? 'Use the fetched source documents below as the evidence base. Cross-check claims between them. Do not add facts that are absent from the evidence. For pubDate, use the primary source publication date shown in PRIMARY PUBLICATION DATE; do not substitute a later update date.'
    : 'Research the topic with live web search. Prefer primary and authoritative sources. Do not rely on search snippets alone.';
  const prompt = `You are the verification and drafting stage of a Chinese AI news publishing workflow.
Current date in Asia/Shanghai: ${today}.

User brief or source URL:
${brief}

${researchInstruction} Cross-check important dates, numbers, product names, organizations, and claims. If the event cannot be verified, return verificationStatus "blocked" and explain why; do not invent details.

Fetched source documents:
${sourceMaterial}

Create exactly one Chinese news draft for this Astro site:
- slug: concise English kebab-case, no date prefix.
- title: factual Chinese headline without clickbait.
- link: best primary source URL.
- category: exactly one of ${JSON.stringify(NEWS_CATEGORIES)}.
- description: one concise sentence that states the event and why it matters.
- pubDate: the verified event or primary announcement date in YYYY-MM-DD, never the drafting date unless the event actually happened today.
- tags: 2-3 values selected only from ${JSON.stringify(tags)}.
- body: Markdown body only, 4-8 concise paragraphs. Separate verified facts from interpretation. Do not include YAML frontmatter or a source list; the server adds those.
- sourceUrls: verified URLs actually used, primary source first.
- verificationNotes: short notes describing what was cross-checked.

This output is a local draft only. Do not claim it has been published.`;

  const raw = await runCodexPromptWithTransientRetry({
    model: model || DEFAULT_MODEL,
    prompt,
    search: sourceDocuments.length === 0,
    outputSchemaPath: newsDraftSchemaPath,
  });

  let generated;
  try {
    generated = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error(`Codex returned invalid structured JSON: ${raw.slice(0, 500)}`), { statusCode: 502 });
  }

  const { errors, normalized } = validateNewsDraft(generated);
  const enforcedPrimaryDate = sourceDocuments[0]?.publishedDate || '';
  if (enforcedPrimaryDate && normalized.pubDate !== enforcedPrimaryDate) {
    errors.push(`pubDate must match the primary source publication date: ${enforcedPrimaryDate}.`);
  }
  if (errors.length) {
    throw Object.assign(new Error(`News verification failed: ${errors.join(' ')}`), {
      statusCode: generated.verificationStatus === 'blocked' ? 422 : 400,
      details: { generated, errors },
    });
  }

  const duplicate = duplicateNews(normalized);
  if (duplicate && !force) {
    throw Object.assign(new Error(`A news item with the same title or link already exists: ${duplicate}`), { statusCode: 409 });
  }

  const finalSlug = duplicate && force ? `${normalized.slug}-${Date.now()}` : normalized.slug;
  const filePath = join(NEWS_DIR, `${finalSlug}.md`);
  if (existsSync(filePath)) {
    throw Object.assign(new Error(`Draft path already exists: ${basename(filePath)}`), { statusCode: 409 });
  }

  const temporaryPath = `${filePath}.tmp-${randomUUID()}`;
  writeFileSync(temporaryPath, newsMarkdown(normalized, true));
  renameSync(temporaryPath, filePath);

  try {
    await runBuild();
  } catch (error) {
    try { unlinkSync(filePath); } catch {}
    throw error;
  }

  return {
    ...normalized,
    slug: finalSlug,
    pubDate: normalized.pubDate,
    draft: true,
    filePath: relative(PROJECT_ROOT, filePath),
    buildPassed: true,
    publishConfirmation: `PUBLISH ${finalSlug}`,
  };
};

const listNewsDrafts = () => readdirSync(NEWS_DIR)
  .filter((name) => name.endsWith('.md'))
  .flatMap((name) => {
    const content = readFileSync(join(NEWS_DIR, name), 'utf8');
    if (!/^draft:\s*true\s*$/m.test(content)) return [];
    return [{
      slug: name.replace(/\.md$/, ''),
      title: content.match(/^title:\s*(.*)$/m)?.[1]?.replace(/^['"]|['"]$/g, '') || name,
      filePath: relative(PROJECT_ROOT, join(NEWS_DIR, name)),
    }];
  });

const publishNewsDraft = async ({ slug, confirmation, publishToken }) => {
  if (!ENABLE_GIT_PUBLISH) {
    throw Object.assign(new Error('Git publishing is disabled. Restart Bridge with AI_AGENT_ENABLE_GIT_PUBLISH=1 and AI_AGENT_PUBLISH_TOKEN.'), { statusCode: 403 });
  }
  if (!PUBLISH_TOKEN || publishToken !== PUBLISH_TOKEN) {
    throw Object.assign(new Error('Publish token is invalid.'), { statusCode: 403 });
  }

  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug || normalizedSlug !== slug) {
    throw Object.assign(new Error('Invalid draft slug.'), { statusCode: 400 });
  }
  if (confirmation !== `PUBLISH ${normalizedSlug}`) {
    throw Object.assign(new Error(`Confirmation must exactly equal: PUBLISH ${normalizedSlug}`), { statusCode: 400 });
  }

  const filePath = join(NEWS_DIR, `${normalizedSlug}.md`);
  if (!existsSync(filePath)) throw Object.assign(new Error('Draft not found.'), { statusCode: 404 });
  const original = readFileSync(filePath, 'utf8');
  if (!/^draft:\s*true\s*$/m.test(original)) {
    throw Object.assign(new Error('The news item is not an unpublished draft.'), { statusCode: 409 });
  }

  const published = original.replace(/^draft:\s*true\s*$/m, 'draft: false');
  writeFileSync(filePath, published);
  try {
    await runBuild();
  } catch (error) {
    writeFileSync(filePath, original);
    throw error;
  }

  const fetchResult = await runProcess('git', ['fetch', '--prune', 'origin'], { cwd: PROJECT_ROOT, timeoutMs: 120000 });
  if (fetchResult.code !== 0) {
    writeFileSync(filePath, original);
    throw Object.assign(new Error(`git fetch failed: ${fetchResult.stderr.slice(-1200)}`), { statusCode: 502 });
  }
  const syncResult = await runProcess('git', ['rev-list', '--left-right', '--count', 'HEAD...origin/main'], { cwd: PROJECT_ROOT });
  if (syncResult.code !== 0 || syncResult.stdout.trim() !== '0\t0') {
    writeFileSync(filePath, original);
    throw Object.assign(new Error(`Local main is not synchronized with origin/main: ${syncResult.stdout.trim()}`), { statusCode: 409 });
  }

  const addResult = await runProcess('git', ['add', '--', filePath], { cwd: PROJECT_ROOT });
  if (addResult.code !== 0) {
    writeFileSync(filePath, original);
    await runProcess('git', ['reset', '--', filePath], { cwd: PROJECT_ROOT });
    throw Object.assign(new Error(`git add failed: ${addResult.stderr}`), { statusCode: 502 });
  }
  const commitResult = await runProcess('git', ['commit', '--only', '-m', `feat(news): publish ${normalizedSlug}`, '--', filePath], { cwd: PROJECT_ROOT });
  if (commitResult.code !== 0) {
    writeFileSync(filePath, original);
    await runProcess('git', ['reset', '--', filePath], { cwd: PROJECT_ROOT });
    throw Object.assign(new Error(`git commit failed: ${commitResult.stderr || commitResult.stdout}`), { statusCode: 502 });
  }
  const pushResult = await runProcess('git', ['push', 'origin', 'HEAD:main'], { cwd: PROJECT_ROOT, timeoutMs: 120000 });
  if (pushResult.code !== 0) {
    throw Object.assign(new Error(`Commit created locally but push failed: ${pushResult.stderr || pushResult.stdout}`), { statusCode: 502 });
  }

  return {
    slug: normalizedSlug,
    filePath: relative(PROJECT_ROOT, filePath),
    draft: false,
    commit: commitResult.stdout.trim(),
    push: pushResult.stderr.trim() || pushResult.stdout.trim(),
  };
};

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    sendJson(res, 403, { error: { message: 'Origin is not allowed.', type: 'cors_error' } }, origin);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'chenyuqing-agent-codex-bridge',
      providerBaseUrl: PROVIDER_BASE_URL,
      defaultModel: DEFAULT_MODEL,
      projectRoot: PROJECT_ROOT,
      newsDrafts: listNewsDrafts().length,
      gitPublishEnabled: ENABLE_GIT_PUBLISH,
    }, origin);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/models') {
    sendJson(res, 200, {
      object: 'list',
      data: [{ id: DEFAULT_MODEL, object: 'model', owned_by: 'custom-codex-provider' }],
    }, origin);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/v1/news/drafts') {
    sendJson(res, 200, { data: listNewsDrafts(), gitPublishEnabled: ENABLE_GIT_PUBLISH }, origin);
    return;
  }

  try {
    if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
      const body = await readJsonBody(req);
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) {
        sendJson(res, 400, { error: { message: 'messages must be a non-empty array.', type: 'invalid_request_error' } }, origin);
        return;
      }
      const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL;
      const answer = await runCodex({ model, messages });
      sendJson(res, 200, {
        id: `codex-${randomUUID()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, message: { role: 'assistant', content: answer }, finish_reason: 'stop' }],
      }, origin);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/news/latest') {
      const body = await readJsonBody(req);
      const source = await discoverLatestNewsSource();
      const brief = `根据最新官方来源生成一篇中文 AI 新闻草稿。突出新信息、适用对象、限制与实际意义，只使用此来源：${source.link}`;
      const draft = await generateNewsDraft({ brief, model: body.model, primaryPublishedDate: source.pubDate });
      sendJson(res, 201, { draft, source, gitPublishEnabled: ENABLE_GIT_PUBLISH }, origin);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/news/drafts') {
      const body = await readJsonBody(req);
      const brief = typeof body.brief === 'string' ? body.brief.trim() : '';
      if (brief.length < 8) {
        sendJson(res, 400, { error: { message: 'brief must contain a topic, facts, or source URL.', type: 'invalid_request_error' } }, origin);
        return;
      }
      const draft = await generateNewsDraft({ brief, model: body.model, force: body.force === true });
      sendJson(res, 201, { draft, gitPublishEnabled: ENABLE_GIT_PUBLISH }, origin);
      return;
    }

    const publishMatch = url.pathname.match(/^\/v1\/news\/drafts\/([a-z0-9-]+)\/publish$/);
    if (req.method === 'POST' && publishMatch) {
      const body = await readJsonBody(req);
      const result = await publishNewsDraft({
        slug: publishMatch[1],
        confirmation: body.confirmation,
        publishToken: body.publishToken,
      });
      sendJson(res, 200, { published: result }, origin);
      return;
    }

    sendJson(res, 404, { error: { message: 'Not found.', type: 'not_found_error' } }, origin);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    sendJson(res, status, {
      error: {
        message: error?.message || 'Bridge request failed.',
        type: status >= 500 ? 'bridge_error' : 'invalid_request_error',
        ...(error?.details ? { details: error.details } : {}),
      },
    }, origin);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Codex Agent Bridge listening on http://${HOST}:${PORT}`);
  console.log(`Provider: ${PROVIDER_BASE_URL}`);
  console.log(`Default model: ${DEFAULT_MODEL}`);
  console.log(`Project root: ${PROJECT_ROOT}`);
  console.log(`Git publishing: ${ENABLE_GIT_PUBLISH ? 'ENABLED (token required)' : 'disabled'}`);
  console.log(`Allowed origins: ${[...ALLOWED_ORIGINS].join(', ')}`);
});
