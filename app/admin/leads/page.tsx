import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Download, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status as string | undefined

  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>>
  let stats: { new: number; contacted: number; qualified: number; converted: number; total: number }
  try {
    leads = await prisma.lead.findMany({
      where: status ? { status: status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    stats = {
      new: await prisma.lead.count({ where: { status: 'NEW' } }),
      contacted: await prisma.lead.count({ where: { status: 'CONTACTED' } }),
      qualified: await prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      converted: await prisma.lead.count({ where: { status: 'CONVERTED' } }),
      total: await prisma.lead.count(),
    }
  } catch {
    leads = []
    stats = { new: 0, contacted: 0, qualified: 0, converted: 0, total: 0 }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-dark">Leads</h1>
        <button className="cta-button-secondary flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-text-light">New</p>
          <p className="text-2xl font-bold text-text-dark">{stats.new}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-text-light">Contacted</p>
          <p className="text-2xl font-bold text-text-dark">{stats.contacted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-text-light">Qualified</p>
          <p className="text-2xl font-bold text-text-dark">{stats.qualified}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-text-light">Converted</p>
          <p className="text-2xl font-bold text-text-dark">{stats.converted}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-text-light">Total</p>
          <p className="text-2xl font-bold text-text-dark">{stats.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <Link
            href="/admin/leads"
            className={`px-4 py-2 rounded-md text-sm ${
              !status ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/leads?status=NEW"
            className={`px-4 py-2 rounded-md text-sm ${
              status === 'NEW' ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            New
          </Link>
          <Link
            href="/admin/leads?status=CONTACTED"
            className={`px-4 py-2 rounded-md text-sm ${
              status === 'CONTACTED' ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            Contacted
          </Link>
          <Link
            href="/admin/leads?status=CONVERTED"
            className={`px-4 py-2 rounded-md text-sm ${
              status === 'CONVERTED' ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark hover:bg-gray-200'
            }`}
          >
            Converted
          </Link>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">{lead.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                  <div>{lead.email}</div>
                  <div className="text-xs">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{lead.service || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{lead.city || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-800' :
                    lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-primary hover:text-primary-600"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-6 text-center text-text-light">No leads found</div>
        )}
      </div>
    </div>
  )
}
