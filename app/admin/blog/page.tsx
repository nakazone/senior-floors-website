import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type BlogPostWithAuthor = Prisma.BlogPostGetPayload<{
  include: { author: { select: { name: true; email: true } } }
}>

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const session = await getServerSession(authOptions)

  let posts: BlogPostWithAuthor[]
  try {
    posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    })
  } catch {
    posts = []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-dark">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="cta-button flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post: BlogPostWithAuthor) => (
              <tr key={post.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-dark">{post.title}</div>
                  <div className="text-sm text-text-light">/{post.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-light">
                  {post.author.name || post.author.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-light">
                  {post.publishedAt 
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : 'Not published'
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-primary hover:text-primary-600"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="p-6 text-center text-text-light">No blog posts yet. Create your first post!</div>
        )}
      </div>
    </div>
  )
}
