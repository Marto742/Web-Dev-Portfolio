import type { MetadataRoute } from 'next'
import { projects } from '@/data/portfolio'
import { posts } from '@/data/blog'
import { slugify } from '@/lib/slugify'

const BASE = 'https://martinpetrov.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries: MetadataRoute.Sitemap = projects.map(p => ({
    url: `${BASE}/work/${slugify(p.title)}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogEntries: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...projectEntries,
    ...blogEntries,
  ]
}
