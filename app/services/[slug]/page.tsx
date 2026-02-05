import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { generateServiceSchema, generateFAQSchema } from '@/lib/schema'
import { portfolioProjects } from '@/data/portfolioProjects'
import { CTA } from '@/components/ui/CTA'
import { EstimateForm } from '@/components/forms/EstimateForm'
import { CheckCircle, Clock, Shield } from 'lucide-react'

export async function generateStaticParams() {
  try {
    const services = await prisma.service.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return services.map((service) => ({ slug: service.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  })
  
  if (!service || !service.published) {
    return {}
  }

  return generateSEOMetadata({
    title: service.metaTitle || service.name,
    description: service.metaDescription || service.description,
    keywords: service.keywords ? service.keywords.split(',').map((k) => k.trim()) : undefined,
    canonical: `/services/${service.slug}`,
  })
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  })

  if (!service || !service.published) {
    notFound()
  }

  const benefits = JSON.parse(service.benefits || '[]')
  const process = JSON.parse(service.process || '[]')
  const faqs = JSON.parse(service.faqs || '[]')

  const serviceProjects = portfolioProjects.filter((p) => p.serviceType === service.name)

  const serviceSchema = generateServiceSchema(service.name, '[City]')
  const faqSchema = service.enableFAQSchema ? generateFAQSchema(faqs) : null

  return (
    <>
      {service.enableServiceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="bg-white">
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 xl:gap-12 lg:items-start">
              <div className="min-w-0">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2">
                  {service.slug === 'hardwood-refinishing' ? 'Professional Hardwood Floor Refinishing' : service.name}
                </h1>
                {service.slug === 'hardwood-refinishing' && (
                  <p className="text-xl sm:text-2xl text-primary-600 font-medium mb-4">
                    Bring Your Hardwood Floors Back to Life
                  </p>
                )}
                <div
                  className="text-lg sm:text-xl text-text-light mb-8 prose prose-lg max-w-none prose-p:mb-4"
                  dangerouslySetInnerHTML={{
                    __html: service.description
                      .split(/\n\n+/)
                      .map((block) => `<p class="mb-4">${block.replace(/\n/g, '<br />')}</p>`)
                      .join(''),
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <CTA href="/free-estimate" variant="primary" className="text-lg px-8 py-4">
                    Get Free Estimate
                  </CTA>
                  <a
                    href="tel:+17207519813"
                    className="cta-button-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
                  >
                    Call (720) 751-9813
                  </a>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg sticky lg:top-24">
                  <h2 className="text-xl font-bold text-primary mb-2">
                    Get Your Free Flooring Estimate
                  </h2>
                  <p className="text-sm text-text-light mb-6">
                    Fill out the form below and we&apos;ll contact you within 24 hours
                  </p>
                  <EstimateForm defaultService={service.slug} />
                  <p className="text-xs text-text-light mt-4 text-center">
                    ✓ No obligation · ✓ Free in-home consultation · ✓ Same-day response · ✓ Serving all Denver metro areas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
              {service.slug === 'hardwood-refinishing' ? 'Benefits of Professional Refinishing' : `Benefits of ${service.name}`}
            </h2>
            {service.slug !== 'hardwood-refinishing' && (
              <div className="prose prose-lg max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: service.description.replace(/\n/g, '<br />') }} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`${service.slug === 'hardwood-refinishing' ? 'lg:grid lg:grid-cols-2 lg:gap-12 lg:items-stretch' : ''}`}>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                  {service.slug === 'hardwood-refinishing' ? 'Our Professional Refinishing Process' : 'Our Installation Process'}
                </h2>
                <p className="text-lg text-gray-600 mb-12">
                  {service.slug === 'hardwood-refinishing'
                    ? "Here's how we deliver outstanding results with precision and care:"
                    : 'We follow a proven process to ensure quality results every time'}
                </p>
                <div className="space-y-8">
                  {process.map((step: any) => (
                    <div key={step.step} className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-primary mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {service.slug === 'hardwood-refinishing' && (
                <div className="mt-10 lg:mt-0 relative w-full min-h-[280px] lg:min-h-0">
                  <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="https://placehold.co/800x600/e8e4e0/c4b8a8?text=Hardwood+Refinishing"
                      alt="Hardwood floor refinishing"
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
              Why Choose Us for {service.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Experienced Team
                </h3>
                <p className="text-gray-600">
                  Our certified installers have years of experience with {service.name.toLowerCase()}
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Warranty Protected
                </h3>
                <p className="text-gray-600">
                  All our installations come with comprehensive warranties
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Quality Materials
                </h3>
                <p className="text-gray-600">
                  We only work with trusted suppliers and premium materials
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio projects for this service */}
        {serviceProjects.length > 0 && (
          <section className="py-16 lg:py-24 border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Our work in {service.name}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Sample projects for this service. View the full portfolio filtered by {service.name}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceProjects.slice(0, 6).map((project) => (
                  <Link
                    key={project.id}
                    href={`/portfolio?service=${service.slug}`}
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
                      <p className="text-sm text-text-light mt-1">{project.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-6">
                <Link href={`/portfolio?service=${service.slug}`} className="text-primary font-medium hover:underline">
                  View all {service.name} projects →
                </Link>
              </p>
            </div>
          </section>
        )}

        {/* FAQs Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq: { question: string; answer: string }, index: number) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary-600 text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              {service.slug === 'hardwood-refinishing' ? 'Request a Free Evaluation & Estimate' : 'Ready to Get Started?'}
            </h2>
            <p className={`text-xl text-primary-100 ${service.slug === 'hardwood-refinishing' ? 'mb-4' : 'mb-8'}`}>
              {service.slug === 'hardwood-refinishing'
                ? "Ready to restore your hardwood floors with professional care and exceptional results? Contact us today to schedule a free consultation. We'll assess your floors, answer your questions, and provide a clear, no-obligation estimate."
                : `Get a free estimate for your ${service.name.toLowerCase()} project today.`}
            </p>
            {service.slug === 'hardwood-refinishing' && (
              <p className="text-lg mb-8 text-secondary font-medium">
                ✨ Transform your hardwood floors — and renew the heart of your home.
              </p>
            )}
            <CTA href="/free-estimate" variant="secondary" className="text-lg px-8 py-4">
              Get Free Estimate
            </CTA>
          </div>
        </section>
      </div>
    </>
  )
}
