import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Flooring Blog',
  description: 'Expert tips, guides, and insights about flooring installation, maintenance, and trends. Learn everything you need to know about flooring.',
  keywords: ['flooring blog', 'flooring tips', 'flooring guide', 'flooring maintenance'],
})

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>>
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })
  } catch {
    posts = []
  }

  return (
    <div className="bg-white">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
            Flooring Blog
          </h1>
          <p className="text-xl text-text-light max-w-3xl">
            Expert tips, guides, and insights about flooring installation, maintenance, and trends.
          </p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const tags = JSON.parse(post.tags || '[]')
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {post.featuredImage && (
                    <div className="aspect-video bg-gray-200 overflow-hidden relative">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded mb-3">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-xl font-bold text-primary mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-text-light mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-text-light">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Draft'
                        }
                      </time>
                      <span className="text-primary font-medium group-hover:underline">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-light">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
