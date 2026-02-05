import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { portfolioProjects } from '@/data/portfolioProjects'
import { CTA } from '@/components/ui/CTA'
import { MapPin, ArrowLeft } from 'lucide-react'

export async function generateStaticParams() {
  try {
    const cities = await prisma.city.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return cities.map((city) => ({ slug: city.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const city = await prisma.city.findUnique({
    where: { slug: params.slug },
  })

  if (!city || !city.published) {
    return {}
  }

  const title = city.metaTitle || 'Flooring Services'
  const description =
    city.metaDescription ||
    `Professional flooring installation and refinishing in ${city.name}, ${city.state}. Hardwood, vinyl, tile, and more. Free estimates.`

  return generateSEOMetadata({
    title,
    description,
    keywords: city.keywords ? city.keywords.split(',').map((k) => k.trim()) : undefined,
    city: `${city.name}, ${city.state}`,
    canonical: `/service-areas/${city.slug}`,
  })
}

export default async function CityServiceAreaPage({
  params,
}: {
  params: { slug: string }
}) {
  const city = await prisma.city.findUnique({
    where: { slug: params.slug },
  })

  if (!city || !city.published) {
    notFound()
  }

  let neighborhoods: string[] = []
  try {
    neighborhoods = JSON.parse(city.neighborhoods || '[]')
  } catch {
    // ignore
  }

  const cityProjects = portfolioProjects.filter((p) => p.citySlug === city.slug)

  return (
    <div className="bg-white">
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-2 text-text-light hover:text-primary transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All service areas
          </Link>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                {city.name}, {city.state}
              </h1>
              <p className="text-xl text-text-light">
                We proudly serve {city.name} and surrounding areas with professional flooring
                installation and refinishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {(city.description || city.localContent) && (
        <section className="pb-12 lg:pb-16 border-t border-gray-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
            <div className="prose prose-lg text-text-dark max-w-none">
              {city.description && (
                <p className="text-text-light leading-relaxed mb-6">{city.description}</p>
              )}
              {city.localContent && (
                <div
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: city.localContent }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {neighborhoods.length > 0 && (
        <section className="py-12 lg:py-16 bg-bg-light">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Areas we serve near {city.name}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {neighborhoods.map((name) => (
                <li key={name}>
                  <span className="inline-block px-3 py-1.5 rounded-full bg-white border border-gray-200 text-text-dark text-sm">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {cityProjects.length > 0 && (
        <section className="py-12 lg:py-16 border-t border-gray-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Projects in {city.name}
            </h2>
            <p className="text-text-light mb-6">
              Sample of our flooring work in this area. View full portfolio for more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio?city=${project.citySlug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg hover:border-primary/10 transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-bg-light">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary group-hover:text-primary-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-text-light mt-1">{project.serviceType}</p>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-6">
              <Link href="/portfolio" className="text-primary font-medium hover:underline">
                View full portfolio →
              </Link>
            </p>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Get a free estimate in {city.name}
          </h2>
          <p className="text-lg text-text-light mb-8 max-w-2xl mx-auto">
            Professional hardwood refinishing, new flooring installation, and repair services.
            Contact us for a free quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
              Get Free Estimate
            </CTA>
            <CTA href="/contact" variant="secondary" className="text-lg px-8 py-4">
              Contact Us
            </CTA>
          </div>
          <p className="mt-6 text-sm text-text-light">
            <Link
              href={`/flooring-installer-${city.slug}`}
              className="text-primary hover:underline"
            >
              Flooring installer in {city.name}
            </Link>
            {' · '}
            <Link href="/service-areas" className="text-primary hover:underline">
              View all service areas
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
