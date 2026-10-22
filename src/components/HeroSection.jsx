import { ShieldCheck, Star, MapPin, Phone, MessageCircle, Shield } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function HeroSection() {
  return (
    <section id="home" className="hero-card">
      {/* Banner Image Container */}
      <div className="hero-banner-wrap">
        <img
          src={STORE_INFO.hero.bannerImage}
          alt={STORE_INFO.hero.headline}
          className="hero-image"
          loading="eager"
        />
        <div className="hero-gradient-overlay" />

        {/* Top Badges */}
        <div className="hero-top-left-badge">
          <ShieldCheck size={14} className="text-[#006572]" />
          <span>{STORE_INFO.hero.quarantineBadgeText}</span>
        </div>

        <div className="hero-top-right-badge">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span>{STORE_INFO.hero.ratingBadgeText}</span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="hero-details">
        <div className="hero-title-block">
          <h1 className="hero-title">{STORE_INFO.hero.headline}</h1>
          <p className="hero-subtitle">{STORE_INFO.hero.subtitle}</p>
        </div>

        <div className="hero-address">
          <MapPin size={16} className="text-[#006572] shrink-0" />
          <span>{STORE_INFO.address}</span>
        </div>

        {/* Call & WhatsApp CTAs */}
        <div className="hero-cta-grid">
          <a href={STORE_INFO.phoneDial} className="hero-btn hero-btn-call">
            <Phone size={18} />
            <span>Call Store</span>
          </a>
          <a
            href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=Hello%20Dolphin%20Aquarium,%20I%20am%20inquiring%20about%20live%20fish%20stock%20and%20prices`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn hero-btn-wa"
          >
            <MessageCircle size={18} />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Assurance Box */}
        <div className="hero-notice-box">
          <Shield size={20} className="text-[#006572] shrink-0" />
          <p className="hero-notice-text">
            {STORE_INFO.hero.highlightNotice}
          </p>
        </div>
      </div>
    </section>
  )
}
