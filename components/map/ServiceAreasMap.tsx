'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

/* Leaflet CSS is imported in app/globals.css for map display */

type CityWithCoords = {
  id: string
  name: string
  slug: string
  state: string
  latitude: number
  longitude: number
}

type ServiceAreasMapProps = {
  cities: CityWithCoords[]
  center: [number, number]
  zoom: number
}

// Fix default marker icon in Next.js (Leaflet uses file paths that break with bundling)
function fixLeafletIcon() {
  const DefaultIcon = L.Icon.Default as unknown as { prototype?: { _getIconUrl?: string } }
  if (typeof DefaultIcon !== 'undefined' && DefaultIcon.prototype) {
    delete DefaultIcon.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }
}

function FitBounds({ cities }: { cities: CityWithCoords[] }) {
  const map = useMap()
  useEffect(() => {
    if (cities.length === 0) return
    if (cities.length === 1) {
      map.setView([cities[0].latitude, cities[0].longitude], 12)
      return
    }
    const bounds = L.latLngBounds(
      cities.map((c) => [c.latitude, c.longitude] as [number, number])
    )
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 })
  }, [map, cities])
  return null
}

export function ServiceAreasMap({ cities, center, zoom }: ServiceAreasMapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      style={{ height: '100%', minHeight: 400 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cities.length > 0 && <FitBounds cities={cities} />}
      {cities.map((city) => (
        <Marker key={city.id} position={[city.latitude, city.longitude]}>
          <Popup>
            <div className="text-center min-w-[140px]">
              <p className="font-semibold text-text-dark">
                {city.name}, {city.state}
              </p>
              <Link
                href={`/service-areas/${city.slug}`}
                className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
              >
                View all projects in the area →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
