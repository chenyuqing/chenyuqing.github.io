import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blogPosts = (await getCollection('blog', ({ data }) => !data.draft))
    .map((post) => ({
      title: `[Blog] ${post.data.title}`,
      pubDate: post.data.pubDate,
      description: post.data.description || '',
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    }));

  const newsItems = (await getCollection('news', ({ data }) => !data.draft))
    .map((item) => ({
      title: `[News] ${item.data.title}`,
      pubDate: item.data.pubDate,
      description: item.data.description || '',
      link: `/news/${item.id}/`,
      categories: item.data.tags,
    }));

  const allItems = [...blogPosts, ...newsItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Tim Chen · AI 时代网志',
    description: '博客文章与 AI 动态。',
    site: context.site,
    items: allItems,
  });
}
