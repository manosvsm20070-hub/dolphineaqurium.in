import { FlaskConical } from 'lucide-react'

export function WaterQualityGuide() {
  return (
    <section className="water-quality-card">
      <div className="water-quality-header">
        <FlaskConical size={26} className="text-[#006572]" />
        <div>
          <h3 className="water-quality-title">Freshwater Quality Quick Check</h3>
          <p className="water-quality-subtitle">
            Recommended water balance for Sothupakkam tap water
          </p>
        </div>
      </div>

      <div className="water-params-grid">
        <div className="param-stat-card">
          <span className="param-stat-label">Avg Temp</span>
          <p className="param-stat-value">25-28°C</p>
          <span className="param-stat-sub">Tropical Range</span>
        </div>

        <div className="param-stat-card">
          <span className="param-stat-label">Safe pH</span>
          <p className="param-stat-value">6.8 - 7.5</p>
          <span className="param-stat-sub">Neutral Zone</span>
        </div>

        <div className="param-stat-card">
          <span className="param-stat-label">Dechlorinate</span>
          <p className="param-stat-value">100%</p>
          <span className="param-stat-sub">Every Water Refill</span>
        </div>
      </div>

      <div className="pro-tip-box">
        <p>
          💡 <strong>Pro Tip:</strong> Bringing home new fish? Always float the
          transport bag in your tank water for 15-20 minutes before releasing to
          prevent sudden temperature shock.
        </p>
      </div>
    </section>
  )
}
