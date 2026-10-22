import { useEffect, useState } from 'react'
import { CartContext } from './CartContextDef'

const STORAGE_KEY = 'dolphin_aquarium_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e)
    }
  }, [items])

  function addToCart(product, selectedSize = null, quantity = 1) {
    const size = selectedSize || product.defaultSize || product.sizes?.[0] || 'Standard'
    const itemKey = `${product.id}-${size}`

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === itemKey)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }
      return [
        ...prev,
        {
          key: itemKey,
          product,
          selectedSize: size,
          quantity,
        },
      ]
    })
    setIsCartOpen(true)
  }

  function removeFromCart(itemKey) {
    setItems((prev) => prev.filter((item) => item.key !== itemKey))
  }

  function updateQuantity(itemKey, delta) {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.key === itemKey) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
