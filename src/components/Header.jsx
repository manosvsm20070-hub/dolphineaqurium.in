import { useState } from 'react'
import {
  Phone,
  MessageCircle,
  ShoppingBag,
  Menu,
  X,
  MapPin,
  Waves,
} from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'
import { useCart } from '../context/useCart'

export function Header({ currentView = 'home', onSelectTab, onNavigateCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'catalog', label: 'Fish Catalog', href: '#catalog' },
    { id: 'motors', label: 'Motors & Pumps', href: '#motors' },
    { id: 'food', label: 'Fish Food', href: '#food' },
    { id: 'tanks', label: 'Tanks & Custom', href: '#tanks' },
    { id: 'medicines', label: 'Care & Medicines', href: '#medicines' },
    { id: 'contact', label: 'Store Info', href: '#contact' },
  ]

  const handleNavClick = (id, href) => {
    setMobileMenuOpen(false)
    if (onSelectTab) onSelectTab(id)
    if (id === 'home' || currentView === 'home') {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleNavClick('home', '#home')}
          className="brand-link"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div className="brand-logo-icon">
            <Waves size={24} className="text-[#006572]" />
          </div>
          <div className="brand-text">
            <span className="brand-title">{STORE_INFO.name}</span>
            <span className="brand-sub">
              <MapPin size={12} className="text-[#006572]" />
              Sothupakkam, Tamil Nadu
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => {
            const isActive =
              (currentView === 'home' && link.id === 'home') ||
              (currentView === 'catalog' && link.id === 'catalog')
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id, link.href)}
                className={`nav-btn ${isActive ? 'nav-btn-active' : ''}`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Action Buttons */}
        <div className="header-actions">
          {/* Call button */}
          <a
            href={STORE_INFO.phoneDial}
            className="action-icon-btn action-call"
            title={`Call ${STORE_INFO.phoneDisplay}`}
            aria-label="Call Store"
          >
            <Phone size={19} />
          </a>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${STORE_INFO.whatsappNumber}?text=Hello%20Dolphin%20Aquarium,%20I%20am%20inquiring%20about%20live%20fish%20stock%20and%20prices`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-icon-btn action-wa"
            title="WhatsApp Dolphin Aquarium"
            aria-label="WhatsApp Store"
          >
            <MessageCircle size={19} />
          </a>

          {/* Shopping Cart button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="action-icon-btn action-cart"
            title="Shopping Cart (Click to open drawer)"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNavClick(link.id, link.href)}
              className="mobile-nav-link"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              if (onNavigateCart) onNavigateCart()
            }}
            className="mobile-nav-link"
          >
            Full Cart ({totalItems} items)
          </button>
          <div className="mobile-contact-row">
            <a href={STORE_INFO.phoneDial} className="btn-call-outline">
              <Phone size={16} /> Call {STORE_INFO.phoneDisplay}
            </a>
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa-fill"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
