import { Metadata } from 'next'
import nextDynamic from 'next/dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { cityCoordinates } from '@/data/cityCoordinates'
import { cities as fallbackCities } from '@/data/cities'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Service Areas',
  description: 'We provide professional flooring installation services throughout [City] and surrounding areas. Find your location and get a free estimate.',
  keywords: ['service areas', 'flooring service areas', 'flooring near me'],
})

export const dynamic = 'force-dynamic'

// Map loads only on client (Leaflet uses window)
const ServiceAreasMap = nextDynamic(
  () => import('@/components/map/ServiceAreasMap').then((mod) => mod.ServiceAreasMap),
  { ssr: false, loading: () => <div className="w-full aspect-video min-h-[400px] bg-bg-light rounded-xl animate-pulse flex items-center justify-center"><span className="text-text-light">Loading map...</span></div> }
)

function groupCitiesByLetter(cities: { name: string; slug: string; state: string }[]) {
  const groups: Record<string, typeof cities> = {}
  for (const city of cities) {
    const letter = city.name.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(city)
  }
  return Object.keys(groups)
    .sort()
    .map((letter) => ({ letter, cities: groups[letter] }))
}

type CityRow = { id: string; name: string; slug: string; state: string; latitude: number | null; longitude: number | null }

export default async function ServiceAreasPage() {
  let cities: CityRow[]
  try {
    cities = await prisma.city.findMany({
      where: { published: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, state: true, latitude: true, longitude: true },
    })
  } catch {
    cities = fallbackCities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: c.state,
      latitude: c.coordinates?.lat ?? null,
      longitude: c.coordinates?.lng ?? null,
    }))
  }

  const byLetter = groupCitiesByLetter(cities)

  // Cities with coordinates for the map (from DB or fallback to cityCoordinates)
  const citiesForMap = cities
    .map((city) => {
      const lat = city.latitude ?? cityCoordinates[city.slug]?.[0]
      const lng = city.longitude ?? cityCoordinates[city.slug]?.[1]
      if (lat == null || lng == null) return null
      return { ...city, latitude: lat, longitude: lng }
    })
    .filter((c): c is NonNullable<typeof c> => c != null)

  return (
    <div className="bg-white">
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4">
            Our Service Areas
          </h1>
          <p className="text-xl text-text-light max-w-3xl mb-2">
            We proudly serve Denver and surrounding Colorado areas with professional flooring installation and services.
          </p>
          <p className="text-sm text-text-light">
            {cities.length} cities and communities
          </p>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Map – left side */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <h2 className="text-xl font-bold text-text-dark mb-3">Find us on the map</h2>
              <div className="sticky top-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-bg-light h-[380px] sm:h-[420px] lg:min-h-[520px]">
                <ServiceAreasMap
                  cities={citiesForMap}
                  center={[39.65, -104.95]}
                  zoom={9}
                />
              </div>
            </div>

            {/* City list – right side */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <h2 className="text-xl font-bold text-primary mb-4">Cities we serve</h2>
              {cities.length === 0 ? (
                <div className="py-8 text-text-light">
                  <p>No service areas configured yet.</p>
                </div>
              ) : (
                <div className="bg-bg-light rounded-xl border border-gray-200 p-5 lg:p-6 max-h-[420px] lg:max-h-[520px] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-6">
                    {byLetter.map(({ letter, cities: letterCities }) => (
                      <div key={letter}>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 pb-1.5 border-b border-gray-200">
                          {letter}
                        </div>
                        <ul className="space-y-1">
                          {letterCities.map((city) => (
                            <li key={city.slug}>
                              <Link
                                href={`/service-areas/${city.slug}`}
                                className="text-text-dark hover:text-primary transition-colors text-sm leading-relax"
                              >
                                {city.name}, {city.state}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-bg-light">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Don&apos;t See Your Area?
          </h2>
          <p className="text-lg text-text-light mb-8">
            We may still service your location. Contact us to find out!
          </p>
          <Link
            href="/contact"
            className="cta-button inline-block text-lg px-8 py-4"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
