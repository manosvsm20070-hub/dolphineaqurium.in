import { MessageCircle } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function FloatingWhatsApp() {
  const waUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    'Hello Dolphin Aquarium, I have an inquiry about fish/tanks'
  )}`

  return (
    <div className="floating-wa-wrap">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        aria-label="Instant WhatsApp Inquiry"
      >
        <span className="wa-ping-indicator">
          <span className="wa-ping-glow" />
          <span className="wa-ping-dot" />
        </span>
        <MessageCircle size={22} />
        <span className="floating-wa-text">WhatsApp</span>
      </a>
    </div>
  )
}
