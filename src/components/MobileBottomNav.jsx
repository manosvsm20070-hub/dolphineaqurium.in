import { Droplets, Fish, Waves, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/useCart'

export function MobileBottomNav({ currentView = 'home', onSelectTab, onNavigateCart }) {
  const { totalItems } = useCart()

  const tabs = [
    { id: 'home', label: 'Home', icon: Droplets },
    { id: 'catalog', label: 'Fish', icon: Fish },
    { id: 'tanks', label: 'Tanks', icon: Waves },
    { id: 'medicines', label: 'Care', icon: ShieldCheck },
  ]

  const handleTabClick = (id) => {
    if (onSelectTab) onSelectTab(id)
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            (currentView === 'home' && tab.id === 'home') ||
            (currentView === 'catalog' && tab.id === 'catalog')
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`mobile-tab-btn ${isActive ? 'mobile-tab-active' : ''}`}
            >
              <Icon size={20} />
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          )
        })}

        {/* Dedicated Cart page button */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateCart) onNavigateCart()
          }}
          className={`mobile-tab-btn ${currentView === 'cart' ? 'mobile-tab-active' : ''}`}
          aria-label="Open Cart"
        >
          <div className="relative-icon-wrap">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="mobile-cart-badge">{totalItems}</span>
            )}
          </div>
          <span className="mobile-tab-label">Cart</span>
        </button>
      </div>
    </nav>
  )
}
