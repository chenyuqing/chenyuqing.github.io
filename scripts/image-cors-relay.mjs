// 本地图片接口 CORS 中转：
//   npm run image:relay
// 浏览器把请求发给 http://127.0.0.1:8789/proxy/{url}，本服务转发到目标接口并补上 CORS 头。
// 仅监听 127.0.0.1，不落盘任何数据；Authorization 等头由浏览器原样带来、原样转发。

import { createServer } from 'node:http';
import { execFile } from 'node:child_process';

const HOST = process.env.IMAGE_RELAY_HOST || '127.0.0.1';
const PORT = Number(process.env.IMAGE_RELAY_PORT || 8789);
const TIMEOUT_MS = Number(process.env.IMAGE_RELAY_TIMEOUT_MS || 300_000);
const MAX_BODY_BYTES = Number(process.env.IMAGE_RELAY_MAX_BODY_BYTES || 20_000_000);
const ALLOWED_ORIGINS = new Set(
  (
    process.env.IMAGE_RELAY_ORIGINS ||
    [
      'http://localhost:4321',
      'http://127.0.0.1:4321',
      'https://chenyuqing.github.io',
      'http://127.0.0.1:3080',
    ].join(',')
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);

const FORWARDED_HEADERS = ['content-type', 'authorization', 'accept', 'accept-language'];

const corsHeaders = (origin) => {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : [...ALLOWED_ORIGINS][0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

const sendJson = (res, status, payload, origin) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) });
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolveBody, rejectBody) => {
  const chunks = [];
  let total = 0;
  req.on('data', (chunk) => {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      rejectBody(Object.assign(new Error('Request body too large.'), { statusCode: 413 }));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => resolveBody(Buffer.concat(chunks)));
  req.on('error', rejectBody);
});

const extractTarget = (url) => {
  const parsed = new URL(url, `http://${HOST}:${PORT}`);
  if (parsed.searchParams.get('url')) return parsed.searchParams.get('url');
  const match = parsed.pathname.match(/^\/proxy\/(.+)$/);
  if (match) return decodeURIComponent(match[1]);
  return '';
};

// curl 转发通道：部分网络环境下 Node fetch 的长请求（~60s 同步生图）会被中间设备
// 按 TLS 指纹/空闲连接重置，而 curl --http1.1 实测稳定完成。响应整包缓冲后回写。
const viaCurl = (targetUrl, method, headers, body) =>
  new Promise((resolve, reject) => {
    const args = [
      '--http1.1', '-sS', '-i',
      '--max-time', String(Math.ceil(TIMEOUT_MS / 1000)),
      '-X', method, targetUrl.toString(),
    ];
    for (const [name, value] of Object.entries(headers)) {
      if (name !== 'host' && name !== 'content-length') args.push('-H', `${name}: ${value}`);
    }
    let stdinBody = null;
    if (body !== undefined && body.length > 0) {
      args.push('--data-binary', '@-');
      stdinBody = body;
    }
    const child = execFile('curl', args, { maxBuffer: 96 * 1024 * 1024, encoding: 'buffer' }, (err, stdout) => {
      const sep = stdout ? stdout.indexOf('\r\n\r\n') : -1;
      if (!stdout || sep === -1) {
        reject(err || new Error('curl produced no response.'));
        return;
      }
      const headRaw = stdout.slice(0, sep).toString('utf8');
      const buffer = stdout.slice(sep + 4);
      const statusMatch = headRaw.split('\r\n')[0].match(/ (\d{3}) /);
      const contentTypeLine = headRaw.split('\r\n').find((line) => /^content-type:/i.test(line));
      resolve({
        status: statusMatch ? Number(statusMatch[1]) : 502,
        contentType: contentTypeLine ? contentTypeLine.split(':').slice(1).join(':').trim() : 'application/octet-stream',
        buffer,
      });
    });
    if (stdinBody) child.stdin.write(stdinBody);
    child.stdin.end();
  });

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || '';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (req.method === 'GET' && new URL(req.url || '/', `http://${HOST}:${PORT}`).pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'image-cors-relay' }, origin);
    return;
  }

  try {
    const target = extractTarget(req.url || '/');
    if (!target) {
      sendJson(res, 400, { error: { message: 'Missing target. Use /proxy/{encoded-url} or /proxy?url=' } }, origin);
      return;
    }
    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      sendJson(res, 400, { error: { message: 'Target is not a valid URL.' } }, origin);
      return;
    }
    if (!/^https?:$/.test(targetUrl.protocol)) {
      sendJson(res, 400, { error: { message: 'Only http(s) targets are allowed.' } }, origin);
      return;
    }

    const body = ['GET', 'HEAD'].includes(req.method || '') ? undefined : await readBody(req);
    const headers = {};
    for (const name of FORWARDED_HEADERS) {
      const value = req.headers[name];
      if (value) headers[name] = value;
    }

    // 统一 curl --http1.1 转发
    const r = await viaCurl(targetUrl, req.method, headers, body);
    res.writeHead(r.status, {
      'Content-Type': r.contentType,
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
    });
    res.end(r.buffer);
  } catch (error) {
    const status = Number(error?.statusCode) || (error?.name === 'TimeoutError' ? 504 : 502);
    sendJson(res, status, { error: { message: error?.message || 'Relay request failed.' } }, origin);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Image CORS relay listening on http://${HOST}:${PORT}`);
  console.log(`Usage: http://${HOST}:${PORT}/proxy/{encoded-target-url}`);
  console.log(`Allowed origins: ${[...ALLOWED_ORIGINS].join(', ')}`);
});
