import { Navigation, Phone } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function StoreLocationCard() {
  return (
    <section id="contact" className="store-location-card">
      <div className="location-card-content">
        <div className="location-header-row">
          <h3 className="location-title">Visit Our Sothupakkam Store</h3>
          <span className="location-badge">Open Daily (9 AM – 9 PM)</span>
        </div>

        <p className="location-address">{STORE_INFO.address}</p>

        <div className="location-actions-row">
          <a
            href={STORE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-location-directions"
          >
            <Navigation size={18} />
            <span>Get Directions on Google Maps</span>
          </a>
          <a
            href={STORE_INFO.phoneDial}
            aria-label="Call Store Directly"
            className="btn-location-call"
          >
            <Phone size={18} />
            <span>Call {STORE_INFO.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
