import { formatPrice } from '../data/storeInfo'
import { useCart } from '../context/useCart'

export function CompactProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart()

  return (
    <article className="compact-product-card">
      <div className="compact-img-wrap">
        <img
          src={product.primaryImage || product.images?.[0]}
          alt={product.name}
          className="compact-img"
          loading="lazy"
        />
      </div>

      <div className="compact-content">
        <div className="compact-badges">
          <span className="compact-cat">{product.category}</span>
          {product.badge && (
            <span className="compact-sub">{product.badge}</span>
          )}
        </div>

        <h3 className="compact-title" title={product.name}>
          {product.name}
        </h3>
        <p className="compact-desc">{product.description}</p>

        <div className="compact-footer">
          <span className="compact-price">{formatPrice(product.price)}</span>
          <div className="compact-buttons">
            {onSelectProduct && (
              <button
                type="button"
                onClick={() => onSelectProduct(product)}
                className="compact-btn-details"
              >
                Details
              </button>
            )}
            <button
              type="button"
              onClick={() => addToCart(product, product.sizes?.[0], 1)}
              className="compact-btn-order"
            >
              Order
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
