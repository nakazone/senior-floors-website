import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateLocalBusinessSchema } from '@/lib/schema'
import { CTA } from '@/components/ui/CTA'
import { services } from '@/data/services'
import Link from 'next/link'
import { MapPin, Phone, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const cities = await prisma.city.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return cities.map((city) => ({ city: city.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  if (!params?.city) return {}
  try {
    const city = await prisma.city.findUnique({
      where: { slug: params.city },
    })
    if (!city || !city.published) return {}
    return generateSEOMetadata({
      title: city.metaTitle || `Flooring Installer in ${city.name}, ${city.state}`,
      description: city.metaDescription || `Professional flooring installation services in ${city.name}, ${city.state}. Hardwood, vinyl, tile, epoxy, and refinishing. Free estimates available.`,
      keywords: city.keywords ? city.keywords.split(',').map((k) => k.trim()) : undefined,
      city: city.name,
      canonical: `/flooring-installer-${city.slug}`,
    })
  } catch {
    return {}
  }
}

export default async function CityLandingPage({ params }: { params: { city: string } }) {
  if (!params?.city) notFound()
  let city
  try {
    city = await prisma.city.findUnique({
      where: { slug: params.city },
    })
  } catch {
    notFound()
  }
  if (!city || !city.published) notFound()

  const neighborhoods = JSON.parse(city.neighborhoods || '[]')
  const publishedServices = await prisma.service.findMany({
    where: { published: true },
    take: 8,
  })

  const localBusinessSchema = generateLocalBusinessSchema({
    name: '[Company Name]',
    telephone: '+1-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.state,
      postalCode: city.zipCode ?? '',
      addressCountry: 'US',
    },
    geo: city.latitude && city.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: city.latitude,
      longitude: city.longitude,
    } : undefined,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="bg-white">
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Flooring Installer in {city.name}, {city.state}
            </h1>
            <p className="text-xl text-text-light max-w-3xl mb-8">
              {city.description || `Professional flooring installation and services in ${city.name} and surrounding areas. Expert installation for hardwood, vinyl, tile, epoxy, and more. Free estimates available.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
                Get Free Estimate
              </CTA>
              <a
                href="tel:+17207519813"
                className="cta-button-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call (720) 751-9813
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Flooring Services in {city.name}
            </h2>
            <p className="text-lg text-text-light mb-8">
              We offer comprehensive flooring services throughout {city.name} and the surrounding {city.state} area.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {publishedServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-primary mb-2 hover:text-primary">
                    {service.name}
                  </h3>
                  <p className="text-sm text-text-light">
                    {service.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Local Areas Section */}
        {neighborhoods.length > 0 && (
          <section className="py-16 lg:py-24 bg-bg-light">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Serving {city.name} Neighborhoods
              </h2>
              <p className="text-lg text-text-light mb-8">
                We provide flooring services throughout {city.name}, including these areas:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {neighborhoods.map((neighborhood: string) => (
                  <div
                    key={neighborhood}
                    className="flex items-center gap-2 bg-white rounded-lg p-4 shadow-sm"
                  >
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-text-dark">{neighborhood}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Local Content */}
        {city.localContent && (
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: city.localContent.replace(/\n/g, '<br />') }} />
            </div>
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-8">
              Why Choose Us for Flooring in {city.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Local Expertise
                </h3>
                <p className="text-text-light">
                  We understand the unique needs of {city.name} homes and businesses, including climate considerations and local building codes.
                </p>
              </div>
              <div>
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Quick Response
                </h3>
                <p className="text-text-light">
                  As a local {city.name} flooring company, we can respond quickly to your needs and provide fast service.
                </p>
              </div>
              <div>
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Community Trusted
                </h3>
                <p className="text-text-light">
                  We've built our reputation serving {city.name} residents and businesses with quality workmanship and excellent service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-600 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Ready to Transform Your {city.name} Floors?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Get a free estimate for your flooring project in {city.name}, {city.state}.
            </p>
            <CTA href="/free-estimate" variant="secondary" className="text-lg px-8 py-4">
              Get Free Estimate
            </CTA>
          </div>
        </section>
      </div>
    </>
  )
}
