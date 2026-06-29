import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const items = (await getCollection('news', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return rss({
    title: 'Tim Chen · 动态',
    description: 'AI 领域最新动态与快讯。',
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      pubDate: item.data.pubDate,
      description: item.data.description || '',
      link: `/news/${item.id}/`,
      categories: item.data.tags,
    })),
  });
}
