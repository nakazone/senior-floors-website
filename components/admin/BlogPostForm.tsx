'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BlogPostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    metaTitle?: string | null
    metaDescription?: string | null
    keywords?: string | null
    excerpt: string
    content: string
    featuredImage?: string | null
    category?: string | null
    tags: string
    cityId?: string | null
    published: boolean
    publishedAt?: Date | null
  }
}

interface City {
  id: string
  name: string
  state: string
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
    keywords: post?.keywords || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featuredImage: post?.featuredImage || '',
    category: post?.category || '',
    tags: post?.tags ? JSON.parse(post.tags) : [],
    cityId: post?.cityId || '',
    published: post?.published ?? false,
  })

  useEffect(() => {
    // Fetch cities for dropdown
    fetch('/api/admin/cities')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = post 
        ? `/api/admin/blog/${post.id}`
        : '/api/admin/blog'
      
      const method = post ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(formData.tags.filter((t: string) => t.trim())),
          publishedAt: formData.published && !post?.publishedAt ? new Date().toISOString() : post?.publishedAt,
        }),
      })

      if (response.ok) {
        router.push('/admin/blog')
        router.refresh()
      } else {
        alert('Error saving blog post')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving blog post')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-dark">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">URL Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="blog-post-title"
          />
          <p className="text-xs text-text-light mt-1">URL: /blog/{formData.slug || 'slug'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Excerpt *</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            required
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={15}
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            placeholder="Write your blog post content here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Featured Image URL</label>
          <input
            type="url"
            value={formData.featuredImage}
            onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* SEO Fields */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-text-dark">SEO Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Meta Title</label>
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Meta Description</label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Keywords</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Categorization */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-text-dark">Categorization</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="e.g., Hardwood, Comparison, Guide"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-dark">Tags</label>
            <button type="button" onClick={addTag} className="text-sm text-primary hover:underline">
              + Add Tag
            </button>
          </div>
          {formData.tags.map((tag: string, index: number) => (
            <input
              key={index}
              type="text"
              value={tag}
              onChange={(e) => {
                const newTags = [...formData.tags]
                newTags[index] = e.target.value
                setFormData({ ...formData, tags: newTags })
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2"
              placeholder={`Tag ${index + 1}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Target City (Optional)</label>
          <select
            value={formData.cityId}
            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">None</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-text-dark">Settings</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-text-dark">Published</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="cta-button disabled:opacity-50"
        >
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="cta-button-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
