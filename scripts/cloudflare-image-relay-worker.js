/**
 * Cloudflare Worker：AI 生图 CORS 中转 v3
 *
 * 部署步骤（Dashboard 方式）：
 *   1. dash.cloudflare.com → Workers & Pages → image-relay → Edit code
 *   2. 用本文件全部内容替换编辑器里的代码，再 Deploy
 *   3. 工具「CORS 代理」填：https://image-relay.motoleisure7983.workers.dev/?url={url}
 *   4. （可选）Settings → Variables → ALLOWED_ORIGINS 追加额外站点（逗号分隔）
 *
 * 说明：
 *  - Worker 不保存任何密钥；API Key 由浏览器经 Authorization 头透传到目标接口。
 *  - 白名单：你的站点 + 本机开发来源（localhost / 127.0.0.1 任意端口）。
 *  - 请求体原样流式转发，同时支持 JSON 与 multipart/form-data（参考图上传）。
 */

const DEFAULT_ALLOWED = ['https://chenyuqing.github.io'];

// 本机开发来源：localhost / 127.0.0.1，任意端口
function isLocalOrigin(origin) {
  try {
    const u = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(u.hostname);
  } catch (e) {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const allowed = new Set(
      (env && env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS : DEFAULT_ALLOWED.join(','))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const origin = request.headers.get('Origin') || '';
    const originAllowed = origin === '' || allowed.has(origin) || isLocalOrigin(origin);
    const fallbackOrigin = [...allowed][0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': originAllowed && origin ? origin : fallbackOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const targetStr = new URL(request.url).searchParams.get('url');

    // 裸访问（地址栏直开、无 ?url=）：只报告服务状态，不转发任何请求
    if (!targetStr) {
      return new Response(JSON.stringify({ ok: true, service: 'image-cors-relay' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    // 只允许自己的站点或本机来源调用，避免沦为公开跳板
    if (!originAllowed) {
      return new Response(JSON.stringify({ error: { message: 'Origin not allowed.' } }), {
        status: 403,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    let target;
    try {
      target = new URL(targetStr);
    } catch (e) {
      return new Response(JSON.stringify({ error: { message: 'Invalid target URL.' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }
    if (!/^https?:$/.test(target.protocol)) {
      return new Response(JSON.stringify({ error: { message: 'Only http(s) targets are allowed.' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
      });
    }

    // 只转发需要的头（密钥经 Authorization 透传，Worker 不落盘）
    const headers = {};
    for (const name of ['content-type', 'authorization', 'accept']) {
      const value = request.headers.get(name);
      if (value) headers[name] = value;
    }

    // body 流式直传：JSON 与 multipart/二进制文件都不破坏
    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
    });

    const outHeaders = new Headers();
    const ct = upstream.headers.get('content-type');
    if (ct) outHeaders.set('Content-Type', ct);
    outHeaders.set('Cache-Control', 'no-store');
    Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v));

    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  },
};
