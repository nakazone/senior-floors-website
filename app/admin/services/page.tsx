import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>>
  try {
    services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    services = []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-dark">Services</h1>
        <Link
          href="/admin/services/new"
          className="cta-button flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Service
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-dark">{service.name}</div>
                  <div className="text-sm text-text-light">{service.shortDescription}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-light">
                  /services/{service.slug}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    service.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
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
        {services.length === 0 && (
          <div className="p-6 text-center text-text-light">No services yet. Create your first service!</div>
        )}
      </div>
    </div>
  )
}
