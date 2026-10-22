import { useState, useMemo, useEffect } from 'react'
import { Fan, Utensils, Sparkles } from 'lucide-react'
import { CartProvider } from './context/CartContext'
import { AnnouncementBar } from './components/AnnouncementBar'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { CategoryNav } from './components/CategoryNav'
import { ProductCard } from './components/ProductCard'
import { CompactProductCard } from './components/CompactProductCard'
import { CustomTankBanner } from './components/CustomTankBanner'
import { WaterQualityGuide } from './components/WaterQualityGuide'
import { StoreTrustSection } from './components/StoreTrustSection'
import { StoreLocationCard } from './components/StoreLocationCard'
import { Footer } from './components/Footer'
import { CartDrawer } from './components/CartDrawer'
import { MobileBottomNav } from './components/MobileBottomNav'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { AdminModal } from './components/AdminModal'
import { CatalogPage } from './pages/CatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { useProducts } from './services/productService'

function Storefront() {
  const [currentView, setCurrentView] = useState('home') // 'home' | 'catalog' | 'product' | 'cart'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [adminModalOpen, setAdminModalOpen] = useState(false)

  // Load products from Supabase (if configured) or fallback sample data
  const { products, loading, isUsingSupabase, sourceMessage, refreshProducts } = useProducts()

  // Handle URL hash routing (e.g., #/catalog, #/cart, #/product/:id, #/admin)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (hash.startsWith('#/product/')) {
        const id = hash.replace('#/product/', '')
        const found = products.find((p) => p.id === id)
        if (found) {
          setSelectedProduct(found)
          setCurrentView('product')
        }
      } else if (hash === '#/catalog') {
        setCurrentView('catalog')
      } else if (hash === '#/cart') {
        setCurrentView('cart')
      } else if (hash === '#/admin' || hash === '#admin') {
        setAdminModalOpen(true)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [products])

  // Categorize products into homepage sections
  const livestock = useMemo(() => {
    let list = products.filter((p) => p.section === 'livestock' || p.category === 'Goldfish' || p.category === 'Betta Fish')
    if (activeCategory === 'goldfish') {
      return list.filter((p) => p.category === 'Goldfish')
    }
    if (activeCategory === 'betta') {
      return list.filter((p) => p.category === 'Betta Fish')
    }
    return list
  }, [products, activeCategory])

  const motors = useMemo(() => {
    return products.filter((p) => p.section === 'motors' || p.category === 'Motors & Pumps')
  }, [products])

  const food = useMemo(() => {
    return products.filter((p) => p.section === 'food' || p.category === 'Fish Food')
  }, [products])

  const essentials = useMemo(() => {
    let list = products.filter((p) => p.section === 'essentials' || p.category === 'Fish Medicines' || p.category === 'Aquarium Bowls')
    if (activeCategory === 'bowls') {
      return list.filter((p) => p.category === 'Aquarium Bowls')
    }
    if (activeCategory === 'medicines') {
      return list.filter((p) => p.category === 'Fish Medicines')
    }
    return list
  }, [products, activeCategory])

  const handleOpenProduct = (product) => {
    setSelectedProduct(product)
    setCurrentView('product')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.location.hash = `#/product/${product.id}`
  }

  const handleNavigateCatalog = (catId = 'all') => {
    setActiveCategory(catId)
    setCurrentView('catalog')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.location.hash = '#/catalog'
  }

  const handleNavigateCart = () => {
    setCurrentView('cart')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.location.hash = '#/cart'
  }

  const handleNavigateHome = () => {
    setCurrentView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.location.hash = '#home'
  }

  const handleNavSelect = (tabId) => {
    if (tabId === 'admin') {
      setAdminModalOpen(true)
    } else if (tabId === 'catalog' || tabId === 'livestock') {
      handleNavigateCatalog('all')
    } else if (tabId === 'motors') {
      handleNavigateCatalog('Motors & Pumps')
    } else if (tabId === 'food') {
      handleNavigateCatalog('Fish Food')
    } else if (tabId === 'medicines') {
      handleNavigateCatalog('Fish Medicines')
    } else if (tabId === 'tanks') {
      if (currentView === 'home') {
        document.getElementById('tanks')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        handleNavigateCatalog('Aquarium Bowls')
      }
    } else if (tabId === 'home') {
      handleNavigateHome()
    } else if (tabId === 'contact') {
      if (currentView === 'home') {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        handleNavigateHome()
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId)
    if (catId === 'motors') {
      document.getElementById('motors')?.scrollIntoView({ behavior: 'smooth' })
    } else if (catId === 'food') {
      document.getElementById('food')?.scrollIntoView({ behavior: 'smooth' })
    } else if (catId === 'tanks' || catId === 'bowls') {
      document.getElementById('tanks')?.scrollIntoView({ behavior: 'smooth' })
    } else if (catId === 'medicines') {
      document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' })
    } else if (catId !== 'all') {
      document.getElementById('livestock')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app-shell">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header
        currentView={currentView}
        onSelectTab={handleNavSelect}
        onNavigateCart={handleNavigateCart}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* VIEW 1: DEDICATED CATALOG PAGE */}
        {currentView === 'catalog' && (
          <CatalogPage
            products={products}
            loading={loading}
            isUsingSupabase={isUsingSupabase}
            sourceMessage={sourceMessage}
            initialCategory={activeCategory}
            onSelectProduct={handleOpenProduct}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* VIEW 2: PRODUCT DETAIL PAGE */}
        {currentView === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentView('catalog')}
            onSelectProduct={handleOpenProduct}
            allProducts={products}
          />
        )}

        {/* VIEW 3: DEDICATED FULL CART PAGE */}
        {currentView === 'cart' && (
          <CartPage
            onNavigateCatalog={() => handleNavigateCatalog('all')}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* VIEW 4: HOMEPAGE (REFERENCE DESIGN) */}
        {currentView === 'home' && (
          <>
            {/* Top Page Heading & Live Specialist Indicator */}
            <div className="page-top-bar">
              <span className="page-title-label">Home</span>
              <span className="status-badge-specialist">
                <span className="pulse-dot-primary" />
                Freshwater Specialist
              </span>
            </div>

            {/* 1. Hero Banner */}
            <HeroSection />

            {/* 2. Category Navigation */}
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* 3. Curated Exotic Arrivals (Featured Live Fish) */}
            <section id="livestock" className="products-section">
              <div className="section-header-block">
                <div className="section-title-wrap">
                  <span className="pulse-dot-primary" />
                  <h2 className="section-title">Curated Exotic Arrivals</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateCatalog('all')}
                  className="section-link-btn"
                >
                  View All in Catalog &rarr;
                </button>
              </div>

              <div className="products-grid">
                {livestock.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={handleOpenProduct}
                  />
                ))}
              </div>
            </section>

            {/* 4. Aquarium Motors & Pumps Section */}
            <section id="motors" className="products-section">
              <div className="section-header-block">
                <div className="section-title-wrap">
                  <Fan size={22} className="text-[#006572]" />
                  <h2 className="section-title">Aquarium Motors &amp; Pumps</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateCatalog('Motors & Pumps')}
                  className="section-link-btn"
                >
                  View All Motors &rarr;
                </button>
              </div>

              {/* 3-Column Feature Highlight Bar */}
              <div className="feature-summary-bar">
                <div className="feature-item-pill">
                  <span className="feature-pill-title">&lt; 30 dB Silent</span>
                  <span className="feature-pill-sub">Zero Vibration Tech</span>
                </div>
                <div className="feature-item-pill feature-item-pill-bordered">
                  <span className="feature-pill-title">Low Wattage</span>
                  <span className="feature-pill-sub">24/7 Continuous Run</span>
                </div>
                <div className="feature-item-pill">
                  <span className="feature-pill-title">Oxygen Boost</span>
                  <span className="feature-pill-sub">Dual Outlets &amp; Spray Bars</span>
                </div>
              </div>

              <div className="products-grid">
                {motors.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={handleOpenProduct}
                  />
                ))}
              </div>
            </section>

            {/* 5. Fish Food & Daily Nutrition Section */}
            <section id="food" className="products-section">
              <div className="section-header-block">
                <div className="section-title-wrap">
                  <Utensils size={22} className="text-[#cc4729]" />
                  <h2 className="section-title">Fish Food &amp; Daily Nutrition</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateCatalog('Fish Food')}
                  className="section-link-btn"
                >
                  View All Food &rarr;
                </button>
              </div>

              {/* 3-Column Feature Highlight Bar */}
              <div className="feature-summary-bar">
                <div className="feature-item-pill">
                  <span className="feature-pill-title feature-pill-title-coral">12% Spirulina</span>
                  <span className="feature-pill-sub">Intense Color Enhancing</span>
                </div>
                <div className="feature-item-pill feature-item-pill-bordered">
                  <span className="feature-pill-title feature-pill-title-coral">45%+ High Protein</span>
                  <span className="feature-pill-sub">Rapid Fin &amp; Body Growth</span>
                </div>
                <div className="feature-item-pill">
                  <span className="feature-pill-title feature-pill-title-coral">Non-Clouding</span>
                  <span className="feature-pill-sub">Clean &amp; Clear Water</span>
                </div>
              </div>

              <div className="products-grid">
                {food.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={handleOpenProduct}
                  />
                ))}
              </div>
            </section>

            {/* 6. Tanks, Filters & Care Essentials (2-Col Compact Grid) */}
            <section id="medicines" className="products-section">
              <div className="section-header-block">
                <div className="section-title-wrap">
                  <Sparkles size={22} className="text-[#006572]" />
                  <h2 className="section-title">Tanks, Filters &amp; Care Essentials</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateCatalog('Fish Medicines')}
                  className="section-link-btn"
                >
                  View Store Supplies &rarr;
                </button>
              </div>

              <div className="compact-products-grid">
                {essentials.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={handleOpenProduct}
                  />
                ))}
              </div>
            </section>

            {/* 7. Custom Made-to-Size Aquarium Fabrication Banner */}
            <CustomTankBanner />

            {/* 8. Freshwater Quality Quick Check */}
            <WaterQualityGuide />

            {/* 9. Store Trust Features (4 cards) */}
            <StoreTrustSection />

            {/* 10. Store Location & Hours Card */}
            <StoreLocationCard />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigateAdmin={() => setAdminModalOpen(true)} />

      {/* Slide-out Cart Drawer with link to full cart */}
      <CartDrawer onViewFullCart={handleNavigateCart} />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp />

      {/* Mobile Sticky Bottom Nav Bar */}
      <MobileBottomNav
        currentView={currentView}
        onSelectTab={handleNavSelect}
        onNavigateCart={handleNavigateCart}
      />

      {/* Admin Panel & Management Console */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onProductUpdated={refreshProducts}
      />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  )
}
