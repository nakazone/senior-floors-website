'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service } from '@/types'

interface ServiceFormProps {
  service?: Service
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    shortDescription: service?.shortDescription || '',
    description: service?.description || '',
    metaTitle: service?.metaTitle || '',
    metaDescription: service?.metaDescription || '',
    keywords: service?.keywords || '',
    published: service?.published ?? true,
    featured: service?.featured ?? false,
    enableFAQSchema: service?.enableFAQSchema ?? true,
    enableServiceSchema: service?.enableServiceSchema ?? true,
    benefits: service?.benefits ? (typeof service.benefits === 'string' ? JSON.parse(service.benefits) : service.benefits) : [''],
    process: service?.process ? (typeof service.process === 'string' ? JSON.parse(service.process) : service.process) : [{ step: 1, title: '', description: '' }],
    faqs: service?.faqs ? (typeof service.faqs === 'string' ? JSON.parse(service.faqs) : service.faqs) : [{ question: '', answer: '' }],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = service 
        ? `/api/admin/services/${service.id}`
        : '/api/admin/services'
      
      const method = service ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          benefits: JSON.stringify(formData.benefits.filter((b: string) => b.trim())),
          process: JSON.stringify(formData.process.filter((p: any) => p.title.trim())),
          faqs: JSON.stringify(formData.faqs.filter((f: any) => f.question.trim())),
        }),
      })

      if (response.ok) {
        router.push('/admin/services')
        router.refresh()
      } else {
        alert('Error saving service')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving service')
    } finally {
      setLoading(false)
    }
  }

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] })
  }

  const addProcessStep = () => {
    setFormData({
      ...formData,
      process: [...formData.process, { step: formData.process.length + 1, title: '', description: '' }],
    })
  }

  const addFAQ = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { question: '', answer: '' }] })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-dark">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Service Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            placeholder="hardwood-flooring"
          />
          <p className="text-xs text-text-light mt-1">URL: /services/{formData.slug || 'slug'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Short Description *</label>
          <input
            type="text"
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Full Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={6}
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
            placeholder="Auto-generated if empty"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Meta Description</label>
          <textarea
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Auto-generated if empty"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Keywords (comma-separated)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-dark">Benefits</h2>
          <button type="button" onClick={addBenefit} className="text-sm text-primary hover:underline">
            + Add Benefit
          </button>
        </div>
        {formData.benefits.map((benefit: string, index: number) => (
          <div key={index}>
            <input
              type="text"
              value={benefit}
              onChange={(e) => {
                const newBenefits = [...formData.benefits]
                newBenefits[index] = e.target.value
                setFormData({ ...formData, benefits: newBenefits })
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder={`Benefit ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Process */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-dark">Process Steps</h2>
          <button type="button" onClick={addProcessStep} className="text-sm text-primary hover:underline">
            + Add Step
          </button>
        </div>
        {formData.process.map((step: { step: number; title: string; description: string }, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-2">
              <label className="block text-sm font-medium text-text-dark mb-1">Step {step.step} Title</label>
              <input
                type="text"
                value={step.title}
                onChange={(e) => {
                  const newProcess = [...formData.process]
                  newProcess[index].title = e.target.value
                  setFormData({ ...formData, process: newProcess })
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
              <textarea
                value={step.description}
                onChange={(e) => {
                  const newProcess = [...formData.process]
                  newProcess[index].description = e.target.value
                  setFormData({ ...formData, process: newProcess })
                }}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-dark">FAQs</h2>
          <button type="button" onClick={addFAQ} className="text-sm text-primary hover:underline">
            + Add FAQ
          </button>
        </div>
        {formData.faqs.map((faq: { question: string; answer: string }, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-2">
              <label className="block text-sm font-medium text-text-dark mb-1">Question</label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => {
                  const newFAQs = [...formData.faqs]
                  newFAQs[index].question = e.target.value
                  setFormData({ ...formData, faqs: newFAQs })
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Answer</label>
              <textarea
                value={faq.answer}
                onChange={(e) => {
                  const newFAQs = [...formData.faqs]
                  newFAQs[index].answer = e.target.value
                  setFormData({ ...formData, faqs: newFAQs })
                }}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-text-dark">Settings</h2>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-text-dark">Published</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-text-dark">Featured</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enableFAQSchema}
              onChange={(e) => setFormData({ ...formData, enableFAQSchema: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-text-dark">Enable FAQ Schema</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enableServiceSchema}
              onChange={(e) => setFormData({ ...formData, enableServiceSchema: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-text-dark">Enable Service Schema</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="cta-button disabled:opacity-50"
        >
          {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
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
