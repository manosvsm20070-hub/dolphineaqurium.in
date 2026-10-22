import { useState, useMemo } from 'react'
import { Search, X, ArrowUpDown, Database, AlertCircle } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'

export function CatalogPage({
  products,
  loading,
  isUsingSupabase,
  sourceMessage,
  initialCategory = 'all',
  onSelectProduct,
  onNavigateHome,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured') // 'featured', 'price-low', 'price-high', 'name'

  // Categories list including 'all'
  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Categories' },
      { id: 'Goldfish', label: 'Goldfish' },
      { id: 'Betta Fish', label: 'Betta Fish' },
      { id: 'Motors & Pumps', label: 'Motors & Pumps' },
      { id: 'Fish Food', label: 'Fish Food' },
      { id: 'Aquarium Bowls', label: 'Fish Bowls' },
      { id: 'Fish Medicines', label: 'Care & Medicines' },
    ]
  }, [])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const matchCat =
            product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            product.section?.toLowerCase() === selectedCategory.toLowerCase()
          if (!matchCat) return false
        }

        // In Stock filter
        if (inStockOnly && product.availability !== 'in_stock') {
          return false
        }

        // Search query filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase()
          const nameMatch = product.name?.toLowerCase().includes(q)
          const descMatch = product.description?.toLowerCase().includes(q)
          const catMatch = product.category?.toLowerCase().includes(q)
          const badgeMatch = product.badge?.toLowerCase().includes(q)
          if (!nameMatch && !descMatch && !catMatch && !badgeMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0 // default 'featured'
      })
  }, [products, selectedCategory, inStockOnly, searchQuery, sortBy])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setInStockOnly(false)
    setSortBy('featured')
  }

  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== 'all' || inStockOnly || sortBy !== 'featured'

  return (
    <div className="catalog-page">
      {/* Breadcrumb Navigation */}
      <nav className="catalog-breadcrumbs" aria-label="Breadcrumbs">
        <button type="button" onClick={onNavigateHome} className="breadcrumb-link">
          Home
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Aquarium Catalog</span>
      </nav>

      {/* Catalog Header & Data Source Status */}
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Livestock &amp; Supplies Catalog</h1>
          <p className="catalog-subtitle">
            Explore our quarantined freshwater fish, powerful filter motors, nutrition, and care essentials.
          </p>
        </div>

        {/* Supabase vs Sample Data Source Badge */}
        <div
          className={`data-source-badge ${
            isUsingSupabase ? 'source-supabase' : 'source-sample'
          }`}
          title={sourceMessage}
        >
          <Database size={14} />
          <span>{isUsingSupabase ? 'Supabase Database Connected' : 'Sample Catalog Data'}</span>
        </div>
      </div>

      {/* Search and Control Bar */}
      <div className="catalog-controls-card">
        {/* Search input */}
        <div className="catalog-search-wrap">
          <Search size={18} className="catalog-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fish species, motors, pellets, remedies..."
            className="catalog-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="catalog-search-clear"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and Sorting controls */}
        <div className="catalog-toolbar-row">
          {/* Stock Filter Checkbox */}
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="filter-checkbox"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort By Dropdown */}
          <div className="sort-dropdown-wrap">
            <ArrowUpDown size={14} className="text-[#006572]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="catalog-cat-pills-row">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`catalog-cat-pill ${isActive ? 'catalog-cat-pill-active' : ''}`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filters-row">
            <span className="active-filters-label">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="filter-chip">
                Category: {selectedCategory}
                <button type="button" onClick={() => setSelectedCategory('all')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="filter-chip">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="filter-chip">
                In Stock Only
                <button type="button" onClick={() => setInStockOnly(false)}>
                  <X size={12} />
                </button>
              </span>
            )}
            {sortBy !== 'featured' && (
              <span className="filter-chip">
                Sorted
                <button type="button" onClick={() => setSortBy('featured')}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-reset-filters"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="catalog-results-bar">
        <span className="results-count-text">
          Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="catalog-loading-state">
          <div className="spinner" />
          <p>Loading live catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty / No Matches State */
        <div className="catalog-empty-state">
          <AlertCircle size={44} className="text-[#006572]" />
          <h3 className="empty-title">No matching products found</h3>
          <p className="empty-desc">
            We couldn't find any aquarium livestock or supplies matching your filter criteria.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-empty-reset"
          >
            Reset Search &amp; Filters
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className="clickable-product-wrap"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
