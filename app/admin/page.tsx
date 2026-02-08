import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, MapPin, MessageSquare, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  let servicesCount: number
  let citiesCount: number
  let blogPostsCount: number
  let leadsCount: number
  let recentLeads: Awaited<ReturnType<typeof prisma.lead.findMany>>
  let newLeadsCount: number
  try {
    const [s, c, b, l, r] = await Promise.all([
      prisma.service.count(),
      prisma.city.count(),
      prisma.blogPost.count({ where: { published: true } }),
      prisma.lead.count(),
      prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    ])
    servicesCount = s
    citiesCount = c
    blogPostsCount = b
    leadsCount = l
    recentLeads = r
    newLeadsCount = await prisma.lead.count({ where: { status: 'NEW' } })
  } catch {
    servicesCount = 0
    citiesCount = 0
    blogPostsCount = 0
    leadsCount = 0
    recentLeads = []
    newLeadsCount = 0
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-dark mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Services</p>
              <p className="text-2xl font-bold text-text-dark">{servicesCount}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <Link href="/admin/services" className="text-sm text-primary hover:underline mt-2 inline-block">
            Manage ?
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Cities</p>
              <p className="text-2xl font-bold text-text-dark">{citiesCount}</p>
            </div>
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <Link href="/admin/cities" className="text-sm text-primary hover:underline mt-2 inline-block">
            Manage ?
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Blog Posts</p>
              <p className="text-2xl font-bold text-text-dark">{blogPostsCount}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <Link href="/admin/blog" className="text-sm text-primary hover:underline mt-2 inline-block">
            Manage ?
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">New Leads</p>
              <p className="text-2xl font-bold text-text-dark">{newLeadsCount}</p>
              <p className="text-xs text-text-light">of {leadsCount} total</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
          <Link href="/admin/leads" className="text-sm text-primary hover:underline mt-2 inline-block">
            View All ?
          </Link>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-text-dark">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{lead.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{lead.service || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentLeads.length === 0 && (
            <div className="p-6 text-center text-text-light">No leads yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
