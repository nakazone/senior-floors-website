import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { menuServices } from '@/data/menuServices'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Flooring Services',
  description: 'Comprehensive flooring services including hardwood, vinyl, tile, epoxy, refinishing, and repairs. Professional installation for residential and commercial properties.',
  keywords: ['flooring services', 'flooring installation', 'hardwood', 'vinyl', 'tile', 'epoxy'],
})

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  let services: { name: string; slug: string; shortDescription: string }[]
  try {
    const fromDb = await prisma.service.findMany({
      where: { published: true },
      orderBy: { featured: 'desc' },
      select: { name: true, slug: true, shortDescription: true },
    })
    services = fromDb
  } catch {
    services = menuServices.map((s) => ({ name: s.name, slug: s.href.replace('/services/', ''), shortDescription: s.shortDescription }))
  }

  return (
    <div className="bg-white">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
            Our Flooring Services
          </h1>
          <p className="text-xl text-text-light max-w-3xl">
            Expert installation and services for all your flooring needs. From hardwood to epoxy, we have got you covered.
          </p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-all group border border-gray-200"
              >
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center group-hover:from-primary-600 group-hover:to-primary-700 transition-all shadow-md group-hover:shadow-lg group-hover:-translate-y-1">
                    <span className="text-3xl filter brightness-0 invert">🏠</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-text-dark mb-3 group-hover:text-primary transition-colors">
                  {service.name}
                </h2>
                <p className="text-text-light mb-4">
                  {service.shortDescription}
                </p>
                <span className="inline-block text-primary font-semibold group-hover:underline">
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-bg-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-lg text-text-light mb-8">
            Our experts can help you choose the perfect flooring solution for your space.
          </p>
          <Link
            href="/free-estimate"
            className="cta-button inline-block text-lg px-8 py-4"
          >
            Get Free Consultation
          </Link>
        </div>
      </section>
    </div>
  )
}
