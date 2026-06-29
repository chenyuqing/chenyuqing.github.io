import { getCollection } from 'astro:content';

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const items = await getCollection('news', ({ data }) => !data.draft && data.pubDate >= cutoff);
  const sorted = items
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((item) => ({
      id: item.id,
      title: item.data.title,
      description: item.data.description || '',
      link: item.data.link || null,
      pubDate: item.data.pubDate.toISOString().slice(0, 10),
      tags: item.data.tags,
      body: item.body || '',
    }));

  return new Response(JSON.stringify(sorted), {
    headers: { 'Content-Type': 'application/json' },
  });
}
