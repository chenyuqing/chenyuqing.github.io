import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const items = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description || '',
    pubDate: post.data.pubDate.toISOString().slice(0, 10),
    tags: post.data.tags,
    series: post.data.series || null,
    lang: post.data.lang || 'zh',
    body: post.body || '',
  }));

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
}
