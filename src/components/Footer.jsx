import { MapPin, Phone, MessageCircle, Waves } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Main Info */}
          <div className="footer-col-main">
            <div className="footer-brand">
              <div className="footer-logo-icon">
                <Waves size={24} className="text-[#006572]" />
              </div>
              <span className="footer-brand-title">{STORE_INFO.name}</span>
            </div>
            <p className="footer-tagline">
              Freshwater livestock, fancy goldfish, show bettas, predator
              monster fish, custom rimless aquariums, and professional aquatic
              equipment. Serving Sothupakkam, Cheyur, Vandavasi, and the
              Chengalpattu region.
            </p>
            <div className="footer-address">
              <MapPin size={16} className="text-[#006572] shrink-0 mt-0.5" />
              <span>{STORE_INFO.address}</span>
            </div>
            <div className="footer-contact-btns">
              <a href={STORE_INFO.phoneDial} className="btn-footer-call">
                <Phone size={15} />
                <span>{STORE_INFO.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=Hello%20Dolphin%20Aquarium`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-footer-wa"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Livestock Catalog Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Livestock Catalog</h4>
            <ul className="footer-links">
              <li><a href="#livestock">Fancy Goldfish (26 Varieties)</a></li>
              <li><a href="#livestock">Show Betta Fish (15 Varieties)</a></li>
              <li><a href="#livestock">King Kamfa &amp; Flowerhorns</a></li>
              <li><a href="#livestock">Breeder Guppies &amp; Endlers</a></li>
              <li><a href="#livestock">Aquarium Sharks</a></li>
              <li><a href="#livestock">Gars, Catfish &amp; Monster Fish</a></li>
            </ul>
          </div>

          {/* Tanks & Supplies Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Tanks &amp; Supplies</h4>
            <ul className="footer-links">
              <li><a href="#tanks">Rimless Glass Tanks</a></li>
              <li><a href="#tanks">Custom Aquariums &amp; Sumps</a></li>
              <li><a href="#motors">Air Pumps &amp; Water Motors</a></li>
              <li><a href="#medicines">Fish Medicines &amp; Water Care</a></li>
              <li><a href="#food">Premium Fish Pellets &amp; Flakes</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; 2026 Dolphin Aquarium. All rights reserved. 100% Healthy Livestock Assurance.
          </p>
          <div className="footer-bottom-links">
            <span>Hours: 9:00 AM – 9:00 PM</span>
            <a href={STORE_INFO.googleMapsUrl} target="_blank" rel="noopener noreferrer">
              Directions &amp; Map
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
