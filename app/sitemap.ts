import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const FLOORING_SLUGS = ['site-finished-wood', 'pre-finished-wood', 'luxury-vinyl', 'engineered-wood', 'laminate'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  const now = new Date()

  // High-priority static pages (sempre incluídos)
  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${baseUrl}/flooring`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${baseUrl}/portfolio`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/service-areas`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/free-estimate`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/schedule-measurement`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/warranty`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${baseUrl}/policies`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ]

  // Flooring types (static)
  const flooringEntries: MetadataRoute.Sitemap = FLOORING_SLUGS.map((slug) => ({
    url: `${baseUrl}/flooring/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  const out: MetadataRoute.Sitemap = [...staticEntries, ...flooringEntries]

  try {
    const [services, cities, locationPages, blogPosts] = await Promise.all([
      prisma.service.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.city.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.locationPage.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ])
    const serviceEntries = services.map((s) => ({ url: `${baseUrl}/services/${s.slug}`, lastModified: s.updatedAt, changeFrequency: 'monthly' as const, priority: 0.9 }))
    const cityEntries = cities.map((c) => ({ url: `${baseUrl}/service-areas/${c.slug}`, lastModified: c.updatedAt, changeFrequency: 'monthly' as const, priority: 0.85 }))
    const locationEntries = locationPages.map((p) => ({ url: `${baseUrl}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 }))
    const blogEntries = blogPosts.map((p) => ({ url: `${baseUrl}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 }))
    out.push(...serviceEntries, ...cityEntries, ...locationEntries, ...blogEntries)
  } catch {
    // Sem banco (ex.: build na Vercel sem DATABASE_URL): sitemap só com páginas estáticas
  }

  return out
}
