/**
 * Cloudflare Worker：AI 生图 CORS 中转
 *
 * 部署步骤（Dashboard 方式）：
 *   1. dash.cloudflare.com → Workers & Pages → Create → Create Worker
 *   2. 部署名随意（如 image-relay），Deploy 后点 Edit code，
 *      用本文件全部内容替换编辑器里的代码，再 Deploy
 *   3. 回到 Worker 页面拿到地址：https://<名字>.<账户>.workers.dev
 *   4. 在生图工具「接口设置」→「CORS 代理」里填：
 *        https://<名字>.<账户>.workers.dev/?url={url}
 *   5. （可选）Settings → Variables → 添加环境变量 ALLOWED_ORIGINS，
 *      多个站点用逗号分隔；不配置则默认放行下方 DEFAULT_ALLOWED
 *
 * 说明：
 *  - Worker 不保存任何密钥；API Key 由用户浏览器经 Authorization 头透传到目标接口。
 *  - 已限制只允许你自己的站点来源调用，防止被陌生人当公共跳板。
 */

const DEFAULT_ALLOWED = [
  'https://chenyuqing.github.io',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];

export default {
  async fetch(request, env) {
    const allowed = new Set(
      (env && env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS : DEFAULT_ALLOWED.join(','))
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const origin = request.headers.get('Origin') || '';
    const fallbackOrigin = [...allowed][0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed.has(origin) ? origin : fallbackOrigin,
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

    // 只允许自己的站点作为来源调用，避免沦为公开跳板
    if (!allowed.has(origin)) {
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

    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
    });

    const outHeaders = new Headers();
    const ct = upstream.headers.get('content-type');
    if (ct) outHeaders.set('Content-Type', ct);
    outHeaders.set('Cache-Control', 'no-store');
    Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v));

    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  },
};
