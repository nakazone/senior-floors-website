import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CTA } from '@/components/ui/CTA'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  })
  
  if (!post || !post.published) {
    return {}
  }

  return generateSEOMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords ? post.keywords.split(',').map((k) => k.trim()) : undefined,
    canonical: `/blog/${post.slug}`,
  })
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      city: {
        select: { name: true, state: true },
      },
    },
  })

  if (!post || !post.published) {
    notFound()
  }

  const tags = JSON.parse(post.tags || '[]')

  return (
    <div className="bg-white">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {post.category && (
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-text-light text-sm">
            <time>
              {post.publishedAt 
                ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Not published'
              }
            </time>
            {post.city && (
              <>
                <span>•</span>
                <span>{post.city.name}, {post.city.state}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <article className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {post.featuredImage && (
            <div className="mb-8 relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
          {tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-text-dark rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-bg-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-lg text-text-light mb-8">
            Get a free estimate for your flooring project today.
          </p>
          <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
            Get Free Estimate
          </CTA>
        </div>
      </section>
    </div>
  )
}
