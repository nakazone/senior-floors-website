import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CitiesPage() {
  let cities: Awaited<ReturnType<typeof prisma.city.findMany>>
  try {
    cities = await prisma.city.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    cities = []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-dark">Cities & Locations</h1>
        <Link
          href="/admin/cities/new"
          className="cta-button flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New City
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cities.map((city) => (
              <tr key={city.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-dark">{city.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-light">{city.state}</td>
                <td className="px-6 py-4 text-sm text-text-light">
                  /flooring-installer-{city.slug}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    city.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {city.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/cities/${city.id}/edit`}
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
        {cities.length === 0 && (
          <div className="p-6 text-center text-text-light">No cities yet. Add your first city!</div>
        )}
      </div>
    </div>
  )
}
