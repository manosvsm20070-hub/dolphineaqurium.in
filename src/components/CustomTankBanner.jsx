import { MessageCircle } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function CustomTankBanner() {
  const whatsappTankUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
    'Hello Dolphin Aquarium, I want a quotation for a custom size aquarium'
  )}`

  return (
    <section id="tanks" className="custom-tank-banner">
      <div className="custom-tank-text">
        <span className="custom-tank-eyebrow">Custom Aquaria Fabrication</span>
        <h2 className="custom-tank-heading">
          Request a Custom Made-to-Size Aquarium
        </h2>
        <p className="custom-tank-desc">
          We build custom low-iron rimless glass tanks, bottom-drainage sumps,
          and hardwood cabinet setups tailored to your room dimensions.
        </p>
      </div>

      <div className="custom-tank-actions">
        <a
          href={whatsappTankUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-custom-tank-request"
        >
          Request Custom Tank
        </a>
        <a
          href={whatsappTankUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-custom-tank-wa"
        >
          <MessageCircle size={18} />
          <span>WhatsApp Quote</span>
        </a>
      </div>
    </section>
  )
}
