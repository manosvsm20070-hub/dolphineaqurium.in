import { useState } from 'react'
import {
  ShoppingCart,
  MessageCircle,
  Thermometer,
  Droplets,
  Users,
  Ruler,
} from 'lucide-react'
import { formatPrice, getWhatsAppProductUrl } from '../data/storeInfo'
import { useCart } from '../context/useCart'

export function ProductCard({ product, onSelectProduct }) {
  const [selectedSize, setSelectedSize] = useState(
    product.defaultSize || product.sizes?.[0] || ''
  )
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, selectedSize, 1)
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
  }

  const handleSelectSize = (e, size) => {
    e.stopPropagation()
    setSelectedSize(size)
  }

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product)
    }
  }

  const isSquare = !product.isLiveFish
  const hasVariants = product.sizes && product.sizes.length > 0

  return (
    <article
      className="product-card group"
      onClick={handleCardClick}
      style={{ cursor: onSelectProduct ? 'pointer' : 'default' }}
    >
      {/* Image Container */}
      <div className={`product-img-wrap ${isSquare ? 'aspect-square' : 'aspect-4-5'}`}>
        <img
          src={product.primaryImage || product.images?.[0]}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />

        {/* Top-Left Badges */}
        <div className="card-top-left-badges">
          <span className="badge-in-stock">
            <span className="pulse-dot" />
            In Stock
          </span>
          {product.badge && (
            <span className="badge-variety">{product.badge}</span>
          )}
        </div>

        {/* Top-Right Badge */}
        {selectedSize && (
          <div className="card-top-right-badge">
            <Ruler size={12} className="text-[#006572]" />
            <span>{selectedSize}</span>
          </div>
        )}

        {/* Environmental Water Parameters (for Live Fish) */}
        {product.isLiveFish && product.waterParams && (
          <div className="card-water-params-bar">
            <span className="param-item" title="Safe pH">
              <Droplets size={12} className="text-[#006572]" />
              {product.waterParams.ph}
            </span>
            <span className="param-item" title="Water Temperature">
              <Thermometer size={12} className="text-[#006572]" />
              {product.waterParams.temp}
            </span>
            <span className="param-item" title="Temperament">
              <Users size={12} className="text-[#006572]" />
              {product.waterParams.temperament}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="product-info-wrap">
        <div className="product-header">
          <div className="product-category-row">
            <span className="product-category">{product.category}</span>
            {product.isLiveFish && (
              <span className="badge-live-tag">Live Stock</span>
            )}
          </div>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
          <p className="product-description">{product.description}</p>

          {/* Size / Variant Selector Buttons */}
          {hasVariants && product.sizes.length > 1 && (
            <div className="variant-buttons-row">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => handleSelectSize(e, size)}
                  className={`variant-pill-btn ${
                    selectedSize === size ? 'variant-pill-active' : ''
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Price & Actions */}
        <div className="product-footer">
          <div className="price-row">
            <div className="price-group">
              <span className="price-current">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="price-original">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="live-sothupakkam-tag">Live in Sothupakkam</span>
          </div>

          <div className="product-actions-grid">
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-add-cart"
            >
              <ShoppingCart size={17} />
              <span>Add to Cart</span>
            </button>
            <a
              href={getWhatsAppProductUrl(product, selectedSize)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="btn-whatsapp-inquire"
            >
              <MessageCircle size={17} />
              <span>WhatsApp</span>
            </a>
          </div>

          {product.isLiveFish && (
            <p className="transit-guarantee-note">
              * Live Fish Transit &amp; Quarantine Guaranteed
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
