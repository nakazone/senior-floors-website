import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCityBySlug, getAllCitySlugs } from '@/data/cities'
import { getServiceBySlug } from '@/data/services'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateServiceSchema, generateFAQSchema } from '@/lib/schema'
import { CTA } from '@/components/ui/CTA'
import { CheckCircle } from 'lucide-react'

export async function generateStaticParams() {
  const slugs = getAllCitySlugs()
  return slugs.map((slug) => ({ city: slug }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getCityBySlug(params.city)
  const service = getServiceBySlug('epoxy-flooring')
  
  if (!city || !service) {
    return {}
  }

  return generateSEOMetadata({
    title: `Epoxy Flooring Installation in ${city.name}, ${city.state}`,
    description: `Professional epoxy floor coating services in ${city.name}, ${city.state}. Durable garage and commercial epoxy flooring. Free estimates available.`,
    keywords: [`epoxy flooring ${city.name}`, `epoxy coating ${city.name}`, `garage floor ${city.name}`],
    city: city.name,
    service: 'Epoxy Flooring',
    canonical: `/epoxy-flooring-${city.slug}`,
  })
}

export default function EpoxyCityPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city)
  const service = getServiceBySlug('epoxy-flooring')

  if (!city || !service) {
    notFound()
  }

  const serviceSchema = generateServiceSchema('Epoxy Flooring Installation', city.name)
  const faqs = typeof service.faqs === 'string' ? JSON.parse(service.faqs || '[]') : (service.faqs ?? [])
  const faqSchema = generateFAQSchema(Array.isArray(faqs) ? faqs : [])
  const benefitsList: string[] = typeof service.benefits === 'string' ? JSON.parse(service.benefits || '[]') : (service.benefits ?? [])
  const neighborhoodsList: string[] = typeof city.neighborhoods === 'string' ? JSON.parse(city.neighborhoods || '[]') : (city.neighborhoods ?? [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="bg-white">
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Epoxy Flooring Installation in {city.name}, {city.state}
            </h1>
            <p className="text-xl text-text-light max-w-3xl mb-8">
              Professional epoxy floor coating services in {city.name}. 
              Durable, chemical-resistant floors for garages and commercial spaces.
            </p>
            <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
              Get Free Estimate
            </CTA>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Epoxy Flooring Services in {city.name}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Transform your {city.name} garage or commercial space with durable epoxy flooring. 
                Our expert team provides professional epoxy installation throughout {city.name} and 
                surrounding {city.state} areas.
              </p>

              <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">
                Benefits of Epoxy Flooring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefitsList.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">
                Serving {city.name} Areas
              </h3>
              <p className="text-gray-700 mb-4">
                We provide epoxy flooring services throughout {city.name}, including:
              </p>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
                {neighborhoodsList.map((neighborhood) => (
                  <li key={neighborhood} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-700">{neighborhood}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Ready for Epoxy Flooring in {city.name}?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get a free estimate for your epoxy flooring project.
            </p>
            <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
              Get Free Estimate
            </CTA>
          </div>
        </section>
      </div>
    </>
  )
}
