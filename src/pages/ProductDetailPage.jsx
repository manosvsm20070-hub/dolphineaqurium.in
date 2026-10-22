import { useState } from 'react'
import {
  ShoppingCart,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Droplets,
  Thermometer,
  Users,
  Ruler,
  Star,
  Plus,
  Minus,
} from 'lucide-react'
import { formatPrice, getWhatsAppProductUrl } from '../data/storeInfo'
import { useCart } from '../context/useCart'

export function ProductDetailPage({ product, onBack, onSelectProduct, allProducts = [] }) {
  const [selectedImage, setSelectedImage] = useState(
    product.primaryImage || product.images?.[0]
  )
  const [selectedSize, setSelectedSize] = useState(
    product.defaultSize || product.sizes?.[0] || 'Standard'
  )
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const images = product.images && product.images.length > 0 ? product.images : [product.primaryImage]
  const hasVariants = product.sizes && product.sizes.length > 0

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity)
  }

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4)

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  return (
    <div className="product-detail-page">
      {/* Back button & Breadcrumbs */}
      <div className="detail-top-nav">
        <button type="button" onClick={onBack} className="btn-back-catalog">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>

        <nav className="detail-breadcrumbs" aria-label="Breadcrumbs">
          <button type="button" onClick={onBack} className="breadcrumb-link">
            Catalog
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-link">{product.category}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="product-detail-grid">
        {/* Left: Image Gallery */}
        <div className="detail-gallery-col">
          <div className="detail-main-img-wrap">
            <img
              src={selectedImage}
              alt={product.name}
              className="detail-main-img"
            />
            <div className="detail-floating-badges">
              <span className="badge-in-stock">
                <span className="pulse-dot" />
                In Stock ({product.stock || 12} available)
              </span>
              {product.badge && (
                <span className="badge-variety">{product.badge}</span>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {images.length > 1 && (
            <div className="detail-thumbnails-row">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`detail-thumb-btn ${
                    selectedImage === imgUrl ? 'detail-thumb-active' : ''
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} preview ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Details */}
        <div className="detail-info-col">
          <div className="detail-meta-row">
            <span className="detail-category-tag">{product.category}</span>
            {product.isLiveFish && (
              <span className="badge-live-tag">Quarantined Live Stock</span>
            )}
            <div className="detail-rating">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span>4.9 (Live Stock Guarantee)</span>
            </div>
          </div>

          <h1 className="detail-product-title">{product.name}</h1>

          {/* Price Block */}
          <div className="detail-price-box">
            <div className="detail-price-row">
              <span className="detail-current-price">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="detail-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discountPercent && (
                <span className="detail-discount-tag">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="detail-tax-notice">
              All taxes included. Local delivery across Sothupakkam &amp; Chengalpattu.
            </p>
          </div>

          {/* Available Sizes / Variants */}
          {hasVariants && (
            <div className="detail-variants-section">
              <label className="variants-label">
                <Ruler size={14} className="text-[#006572]" />
                <span>Available Sizes / Options:</span>
              </label>
              <div className="detail-size-pills">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`detail-size-pill ${
                      selectedSize === size ? 'detail-size-pill-active' : ''
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls & Purchase Buttons */}
          <div className="detail-actions-section">
            <div className="detail-qty-row">
              <span className="qty-label">Quantity:</span>
              <div className="qty-stepper detail-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-number detail-qty-num">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="detail-buttons-grid">
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-detail-add-cart"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart ({formatPrice(product.price * quantity)})</span>
              </button>

              <a
                href={getWhatsAppProductUrl(product, selectedSize)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-detail-whatsapp"
              >
                <MessageCircle size={18} />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="detail-desc-block">
            <h3 className="detail-section-heading">Product Overview</h3>
            <p className="detail-description-text">{product.description}</p>
          </div>

          {/* Environmental Care Specifications for Live Fish */}
          {product.isLiveFish && product.waterParams && (
            <div className="detail-specs-card">
              <h3 className="detail-section-heading">Water &amp; Habitat Parameters</h3>
              <div className="detail-specs-grid">
                <div className="spec-item">
                  <Droplets size={16} className="text-[#006572]" />
                  <div>
                    <span className="spec-label">Safe pH Range</span>
                    <p className="spec-value">{product.waterParams.ph}</p>
                  </div>
                </div>
                <div className="spec-item">
                  <Thermometer size={16} className="text-[#006572]" />
                  <div>
                    <span className="spec-label">Water Temperature</span>
                    <p className="spec-value">{product.waterParams.temp}</p>
                  </div>
                </div>
                <div className="spec-item">
                  <Users size={16} className="text-[#006572]" />
                  <div>
                    <span className="spec-label">Temperament</span>
                    <p className="spec-value">{product.waterParams.temperament}</p>
                  </div>
                </div>
                <div className="spec-item">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <div>
                    <span className="spec-label">Quarantine Period</span>
                    <p className="spec-value">14 Days Tap-Conditioned</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Equipment Technical Specifications */}
          {product.specs && (
            <div className="detail-specs-card">
              <h3 className="detail-section-heading">Technical Specifications</h3>
              <div className="detail-specs-grid">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <div>
                      <span className="spec-label">{key}</span>
                      <p className="spec-value">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store Guarantee Box */}
          <div className="detail-guarantee-box">
            <Shield size={22} className="text-[#006572] shrink-0" />
            <div>
              <h4 className="guarantee-title">Dolphin Aquarium Transit Guarantee</h4>
              <p className="guarantee-desc">
                Oxygen-injected medical grade packaging ensures 100% safe live delivery across Sothupakkam &amp; Chengalpattu region.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="detail-related-section">
          <h2 className="related-section-title">Similar Items You Might Like</h2>
          <div className="products-grid">
            {relatedProducts.map((relProduct) => (
              <div
                key={relProduct.id}
                onClick={() => onSelectProduct && onSelectProduct(relProduct)}
                className="clickable-product-wrap"
              >
                <div className="product-card group">
                  <div className="product-img-wrap aspect-4-5">
                    <img
                      src={relProduct.primaryImage || relProduct.images?.[0]}
                      alt={relProduct.name}
                      className="product-img"
                    />
                  </div>
                  <div className="product-info-wrap">
                    <span className="product-category">{relProduct.category}</span>
                    <h4 className="product-title">{relProduct.name}</h4>
                    <span className="price-current">{formatPrice(relProduct.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
