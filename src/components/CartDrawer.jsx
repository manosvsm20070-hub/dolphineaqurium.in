import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '../context/useCart'
import { formatPrice, STORE_INFO } from '../data/storeInfo'

export function CartDrawer({ onViewFullCart }) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  } = useCart()

  if (!isCartOpen) return null

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return

    const itemListText = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (${item.selectedSize}) x ${
            item.quantity
          } = ${formatPrice(item.product.price * item.quantity)}`
      )
      .join('\n')

    const message = `Hello Dolphin Aquarium, I would like to place an order from your website:\n\n${itemListText}\n\n*Total Order Value:* ${formatPrice(
      subtotal
    )}\n\nPlease confirm stock availability and transit delivery to my address.`

    const waUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={20} className="text-[#006572]" />
            <h3 className="cart-title">Your Aquarium Cart</h3>
            <span className="cart-count-badge">({totalItems})</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="cart-close-btn"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-body">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} className="cart-empty-icon" />
              <p className="cart-empty-text">Your cart is currently empty</p>
              <p className="cart-empty-sub">
                Explore our healthy freshwater livestock, high-power motors, and nutrition.
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="cart-browse-btn"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.key} className="cart-item-row">
                  <img
                    src={item.product.primaryImage || item.product.images?.[0]}
                    alt={item.product.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    <span className="cart-item-variant">
                      Size: {item.selectedSize}
                    </span>
                    <span className="cart-item-price">
                      {formatPrice(item.product.price)}
                    </span>

                    {/* Quantity Adjustment */}
                    <div className="cart-qty-row">
                      <div className="qty-stepper">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, -1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.key, 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.key)}
                        className="cart-delete-btn"
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-value">{formatPrice(subtotal)}</span>
            </div>

            <p className="cart-delivery-note">
              🌊 Free live fish transit across Sothupakkam on orders over ₹1,500!
            </p>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="btn-cart-whatsapp"
            >
              <MessageCircle size={18} />
              <span>Order via WhatsApp</span>
            </button>

            {onViewFullCart && (
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false)
                  onViewFullCart()
                }}
                className="btn-cart-full-page"
              >
                View Full Shopping Cart &rarr;
              </button>
            )}

            <button
              type="button"
              onClick={clearCart}
              className="btn-cart-clear"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
