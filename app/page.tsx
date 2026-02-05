import { Metadata } from 'next'
import { Hero } from '@/components/marketing/Hero'
import { Services } from '@/components/marketing/Services'
import { AboutUs } from '@/components/marketing/AboutUs'
import { Testimonials } from '@/components/marketing/Testimonials'
import { WhyChooseUs } from '@/components/marketing/WhyChooseUs'
import { ContactSection } from '@/components/marketing/ContactSection'
import { CTA } from '@/components/ui/CTA'
import { generateLocalBusinessSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Professional Flooring Installation & Services',
  description: 'Expert flooring installation and services including hardwood, vinyl, tile, epoxy, and refinishing. Free estimates available. Serving [City] and surrounding areas.',
  keywords: ['flooring installation', 'hardwood flooring', 'vinyl flooring', 'tile installation', 'epoxy flooring', 'floor refinishing', 'flooring contractor'],
  alternates: { canonical: '/' },
}

export default function HomePage() {
  const localBusinessSchema = generateLocalBusinessSchema({
    name: '[Company Name]',
    telephone: '+1-XXX-XXX-XXXX',
    address: {
      '@type': 'PostalAddress',
      addressLocality: '[City]',
      addressRegion: '[State]',
      postalCode: '[ZIP]',
      addressCountry: 'US',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
    },
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Hero />
      <AboutUs />
      <Services />
      <WhyChooseUs />
      <Testimonials />
      <ContactSection />
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary-600 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get a free estimate today and see how we can help bring your vision to life.
          </p>
          <CTA href="/free-estimate" variant="secondary" className="text-lg px-8 py-4">
            Get Free Estimate
          </CTA>
        </div>
      </section>
    </>
  )
}
