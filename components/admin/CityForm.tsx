'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { City } from '@prisma/client'

interface CityFormProps {
  city?: City
}

export function CityForm({ city }: CityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: city?.name || '',
    slug: city?.slug || '',
    state: city?.state || '',
    zipCode: city?.zipCode || '',
    metaTitle: city?.metaTitle || '',
    metaDescription: city?.metaDescription || '',
    keywords: city?.keywords || '',
    description: city?.description || '',
    localContent: city?.localContent || '',
    neighborhoods: city?.neighborhoods ? JSON.parse(city.neighborhoods) : [''],
    latitude: city?.latitude?.toString() || '',
    longitude: city?.longitude?.toString() || '',
    published: city?.published ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = city 
        ? `/api/admin/cities/${city.id}`
        : '/api/admin/cities'
      
      const method = city ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          neighborhoods: JSON.stringify(formData.neighborhoods.filter((n: string) => n.trim())),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      })

      if (response.ok) {
        router.push('/admin/cities')
        router.refresh()
      } else {
        alert('Error saving city')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error saving city')
    } finally {
      setLoading(false)
    }
  }

  const addNeighborhood = () => {
    setFormData({ ...formData, neighborhoods: [...formData.neighborhoods, ''] })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-dark">Basic Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">City Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              required
              maxLength={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="CO"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">URL Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="denver"
            />
            <p className="text-xs text-text-light mt-1">URL: /flooring-installer-{formData.slug || 'slug'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">ZIP Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Local Content</label>
          <textarea
            value={formData.localContent}
            onChange={(e) => setFormData({ ...formData, localContent: e.target.value })}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Content specific to this city..."
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
            placeholder={`Flooring Installer in ${formData.name || 'City'}, ${formData.state || 'State'}`}
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
            placeholder="flooring installer, hardwood flooring, city name"
          />
        </div>
      </div>

      {/* Location Data */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-text-dark">Location Data</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-dark">Neighborhoods</label>
            <button type="button" onClick={addNeighborhood} className="text-sm text-primary hover:underline">
              + Add Neighborhood
            </button>
          </div>
          {formData.neighborhoods.map((neighborhood: string, index: number) => (
            <input
              key={index}
              type="text"
              value={neighborhood}
              onChange={(e) => {
                const newNeighborhoods = [...formData.neighborhoods]
                newNeighborhoods[index] = e.target.value
                setFormData({ ...formData, neighborhoods: newNeighborhoods })
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2"
              placeholder={`Neighborhood ${index + 1}`}
            />
          ))}
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
          {loading ? 'Saving...' : city ? 'Update City' : 'Create City'}
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
