import { ShieldCheck, Handshake, Wrench, Clock } from 'lucide-react'

export function StoreTrustSection() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Transit Guarantee',
      desc: 'Oxygen-injected medical grade bags ensuring 100% safe live arrival on local deliveries.',
    },
    {
      icon: Handshake,
      title: 'Store Consultation',
      desc: 'Personalized guidance on fish compatibility, biological cycling, feeding, and disease diagnosis.',
    },
    {
      icon: Wrench,
      title: 'Custom Aquascaping',
      desc: 'Complete planted nano setups, predator monster fish setups, and community biotope installations.',
    },
    {
      icon: Clock,
      title: 'Daily Open Hours',
      desc: 'Open 7 days a week from 9:00 AM to 9:00 PM for all livestock, tank accessories, and food supplies.',
    },
  ]

  return (
    <section className="store-trust-grid">
      {trustFeatures.map((feat, idx) => {
        const IconComponent = feat.icon
        return (
          <div key={idx} className="trust-card">
            <div className="trust-icon-box">
              <IconComponent size={22} className="text-[#006572]" />
            </div>
            <h4 className="trust-title">{feat.title}</h4>
            <p className="trust-desc">{feat.desc}</p>
          </div>
        )
      })}
    </section>
  )
}
