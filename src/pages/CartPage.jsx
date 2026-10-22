import { useState } from 'react'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  Truck,
  ShieldCheck,
} from 'lucide-react'
import { formatPrice, STORE_INFO } from '../data/storeInfo'
import { useCart } from '../context/useCart'

export function CartPage({ onNavigateCatalog, onNavigateHome }) {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
  } = useCart()
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const FREE_DELIVERY_THRESHOLD = 1500
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return

    const itemListText = items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.product.name}* (Size: ${item.selectedSize}) x ${
            item.quantity
          } = ${formatPrice(item.product.price * item.quantity)}`
      )
      .join('\n')

    const notesText = deliveryNotes.trim()
      ? `\n\n*Delivery Address / Notes:*\n${deliveryNotes.trim()}`
      : ''

    const message = `Hello Dolphin Aquarium, I want to place an order from your website:\n\n${itemListText}\n\n*Total Order Value:* ${formatPrice(
      subtotal
    )}${notesText}\n\nPlease confirm livestock availability and delivery schedule.`

    const waUrl = `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="cart-page">
      {/* Top Breadcrumbs */}
      <nav className="catalog-breadcrumbs" aria-label="Breadcrumbs">
        <button type="button" onClick={onNavigateHome} className="breadcrumb-link">
          Home
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Shopping Cart</span>
      </nav>

      <div className="cart-page-header">
        <h1 className="cart-page-title">Your Aquarium Shopping Cart</h1>
        <span className="cart-page-subtitle">
          Review your selected livestock, equipment, and nutrition before placing an order.
        </span>
      </div>

      {items.length === 0 ? (
        /* Empty Cart State */
        <div className="cart-empty-view">
          <div className="empty-cart-icon-circle">
            <ShoppingBag size={48} className="text-[#006572]" />
          </div>
          <h2 className="empty-view-heading">Your cart is currently empty</h2>
          <p className="empty-view-sub">
            Looks like you haven't added any freshwater fish, motors, or aquarium supplies yet.
          </p>
          <button
            type="button"
            onClick={onNavigateCatalog}
            className="btn-empty-browse"
          >
            <ArrowLeft size={16} />
            <span>Browse Livestock &amp; Equipment</span>
          </button>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="cart-page-grid">
          {/* Left Column: Cart Items Table */}
          <div className="cart-table-col">
            <div className="cart-items-card">
              <div className="cart-items-card-header">
                <span className="cart-items-header-title">
                  Items in Cart ({totalItems})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="btn-clear-all"
                >
                  Clear All
                </button>
              </div>

              <div className="cart-page-items-list">
                {items.map((item) => (
                  <div key={item.key} className="cart-page-item-row">
                    <img
                      src={item.product.primaryImage || item.product.images?.[0]}
                      alt={item.product.name}
                      className="cart-page-item-img"
                    />

                    <div className="cart-page-item-details">
                      <div className="item-title-row">
                        <h3 className="cart-page-item-title">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="cart-page-remove-btn"
                          aria-label="Remove item"
                          title="Remove from cart"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <span className="cart-page-item-variant">
                        Option: {item.selectedSize}
                      </span>

                      <div className="cart-page-item-bottom">
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

                        <div className="cart-item-price-col">
                          <span className="cart-item-line-total">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <span className="cart-item-unit-price">
                            {formatPrice(item.product.price)} each
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Notes / Instructions Card */}
            <div className="cart-delivery-instructions-card">
              <label htmlFor="delivery-notes" className="delivery-notes-label">
                <Truck size={16} className="text-[#006572]" />
                <span>Delivery Address / Landmark Notes:</span>
              </label>
              <textarea
                id="delivery-notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Enter your street address, nearby landmark, or delivery time preference in Sothupakkam / Chengalpattu..."
                rows={3}
                className="delivery-notes-input"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h3 className="summary-title">Order Summary</h3>

              {/* Free delivery progress message */}
              <div
                className={`delivery-progress-box ${
                  isFreeDelivery ? 'delivery-free' : 'delivery-pending'
                }`}
              >
                <Truck size={16} />
                <span>
                  {isFreeDelivery
                    ? '🎉 You qualify for FREE Live Fish Transit & Delivery!'
                    : `Add ${formatPrice(
                        amountToFreeDelivery
                      )} more to get FREE Local Delivery!`}
                </span>
              </div>

              <div className="summary-lines">
                <div className="summary-line">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="summary-val">{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-line">
                  <span>Local Transit &amp; Packaging</span>
                  <span className="summary-val">
                    {isFreeDelivery ? 'FREE' : '₹50'}
                  </span>
                </div>
              </div>

              <div className="summary-total-row">
                <span className="summary-total-label">Estimated Total</span>
                <span className="summary-total-val">
                  {formatPrice(isFreeDelivery ? subtotal : subtotal + 50)}
                </span>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="btn-checkout-whatsapp"
              >
                <MessageCircle size={20} />
                <span>Place Order via WhatsApp</span>
              </button>

              <div className="summary-assurances">
                <div className="assurance-bullet">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>No upfront online payment required</span>
                </div>
                <div className="assurance-bullet">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Oxygen-packed live fish arrival guarantee</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateCatalog}
                className="btn-summary-continue"
              >
                <ArrowLeft size={14} />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
