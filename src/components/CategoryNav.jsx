import { Fan, Utensils, CircleDot, Fish, Box, ShieldCheck, Sparkles } from 'lucide-react'
import { SAMPLE_CATEGORIES } from '../data/sampleProducts'

const iconMap = {
  Sparkles: Sparkles,
  Fan: Fan,
  Utensils: Utensils,
  CircleDot: CircleDot,
  Fish: Fish,
  Box: Box,
  ShieldCheck: ShieldCheck,
}

export function CategoryNav({ activeCategory, onSelectCategory }) {
  return (
    <section className="category-section">
      <div className="section-header-row">
        <h2 className="section-title">Explore Livestock & Gear</h2>
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="section-link-btn"
        >
          View All &rarr;
        </button>
      </div>

      <div className="category-pills-row">
        {SAMPLE_CATEGORIES.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Sparkles
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`cat-pill ${isActive ? 'cat-pill-active' : ''}`}
            >
              <IconComponent size={14} className={isActive ? 'text-white' : 'text-[#006572]'} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
