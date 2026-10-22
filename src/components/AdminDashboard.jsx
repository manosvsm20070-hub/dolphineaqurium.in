import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Lock,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Fish,
  Package,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import {
  adminSignIn,
  adminSignOut,
  onAdminAuthStateChange,
  checkIsAdmin
} from '../services/adminAuthService'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from '../services/productService'
import { isSupabaseConfigured } from '../lib/supabase'

export function AdminDashboard({ isOpen, onClose, onProductUpdated }) {
  // Auth state
  const [authLoading, setAuthLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState(null)

  // Product management state
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)
  const [actionMessage, setActionMessage] = useState(null) // { type: 'success'|'error', text: string }

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  // Edit / Add Modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null) // null for new, object for edit
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)

  // Product Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Goldfish',
    sub_category: '',
    variety: '',
    section: 'livestock',
    price: '',
    original_price: '',
    stock: 10,
    availability: 'in_stock',
    primary_image: '',
    sizes: '3 inch, 4 inch',
    description: '',
    is_live_fish: true,
    published: true,
    ph: '7.0 - 7.5',
    temp: '22-26°C',
    temperament: 'Peaceful'
  })

  // Delete Confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Migration guide toggle
  const [showMigrationHelp, setShowMigrationHelp] = useState(false)
  const [sqlCopied, setSqlCopied] = useState(false)

  // 1. Subscribe to Auth state changes
  useEffect(() => {
    const unsubscribe = onAdminAuthStateChange(({ user, isAdmin: adminStatus, role, loading }) => {
      setCurrentUser(user)
      setIsAdmin(adminStatus)
      setUserRole(role)
      setAuthLoading(loading)
    })
    return () => unsubscribe()
  }, [])

  // 2. Load products (admin view includes unpublished)
  const loadAdminProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const res = await fetchProducts(true)
      setProducts(res.products || [])
      setIsUsingSupabase(res.isUsingSupabase)
    } catch (err) {
      console.error('[AdminDashboard] Failed to fetch products:', err)
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    if (isOpen) {
      fetchProducts(true).then((res) => {
        if (!ignore) {
          setProducts(res.products || [])
          setIsUsingSupabase(res.isUsingSupabase)
        }
      }).catch((err) => {
        if (!ignore) {
          console.error('[AdminDashboard] Failed to fetch products:', err)
        }
      })
    }
    return () => {
      ignore = true
    }
  }, [isOpen])

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.')
      return
    }

    setLoginSubmitting(true)
    setLoginError(null)

    const res = await adminSignIn(loginEmail, loginPassword)
    setLoginSubmitting(false)

    if (res.error) {
      setLoginError(res.error.message || 'Login failed. Please check your credentials.')
      return
    }

    setCurrentUser(res.user)
    setIsAdmin(res.isAdmin)
    setUserRole(res.role)

    if (res.user && !res.isAdmin) {
      setLoginError('Authentication succeeded, but this account is not registered in public.admin_users.')
    } else {
      loadAdminProducts()
    }
  }

  // Handle Sign Out
  const handleSignOut = async () => {
    await adminSignOut()
    setCurrentUser(null)
    setIsAdmin(false)
    setUserRole(null)
    setLoginEmail('')
    setLoginPassword('')
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.variety && p.variety.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchCategory =
        categoryFilter === 'all' || p.category === categoryFilter

      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && p.stock > 0) ||
        (stockFilter === 'out_of_stock' && p.stock <= 0) ||
        (stockFilter === 'published' && p.published) ||
        (stockFilter === 'draft' && !p.published)

      return matchSearch && matchCategory && matchStock
    })
  }, [products, searchTerm, categoryFilter, stockFilter])

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length
    const inStock = products.filter((p) => p.stock > 0).length
    const liveFish = products.filter((p) => p.is_live_fish || p.section === 'livestock').length
    const published = products.filter((p) => p.published).length
    return { total, inStock, liveFish, published }
  }, [products])

  // Open Add Product
  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: 'Goldfish',
      sub_category: 'Oranda',
      variety: '',
      section: 'livestock',
      price: '',
      original_price: '',
      stock: 10,
      availability: 'in_stock',
      primary_image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
      sizes: '3.5 inch, 4.5 inch',
      description: '',
      is_live_fish: true,
      published: true,
      ph: '7.2 - 7.6',
      temp: '20-24°C',
      temperament: 'Peaceful'
    })
    setFormError(null)
    setEditModalOpen(true)
  }

  // Open Edit Product
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      category: product.category || 'Goldfish',
      sub_category: product.sub_category || '',
      variety: product.variety || '',
      section: product.section || 'livestock',
      price: product.price ? String(product.price) : '',
      original_price: product.original_price ? String(product.original_price) : '',
      stock: product.stock ?? 0,
      availability: product.availability || (product.stock > 0 ? 'in_stock' : 'out_of_stock'),
      primary_image: product.primary_image || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      description: product.description || '',
      is_live_fish: Boolean(product.is_live_fish),
      published: product.published !== false,
      ph: product.water_params?.ph || '7.2 - 7.6',
      temp: product.water_params?.temp || '20-24°C',
      temperament: product.water_params?.temperament || 'Peaceful'
    })
    setFormError(null)
    setEditModalOpen(true)
  }

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit.')
      return
    }

    setImageUploading(true)
    setFormError(null)

    const { url, error } = await uploadProductImage(file)
    setImageUploading(false)

    if (error) {
      setFormError(`Image upload failed: ${error.message}. You can also paste an image URL directly.`)
    } else if (url) {
      setFormData((prev) => ({ ...prev, primary_image: url }))
      setActionMessage({ type: 'success', text: 'Image uploaded to Supabase Storage successfully!' })
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Product name is required.')
      return
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setFormError('Please provide a valid price (greater than or equal to 0).')
      return
    }

    setFormSubmitting(true)
    setFormError(null)

    const sizesArray = formData.sizes
      ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      sub_category: formData.sub_category.trim() || null,
      variety: formData.variety.trim() || null,
      section: formData.section,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock, 10) || 0,
      availability: parseInt(formData.stock, 10) > 0 ? formData.availability : 'out_of_stock',
      primary_image: formData.primary_image.trim() || null,
      images: formData.primary_image.trim() ? [formData.primary_image.trim()] : [],
      sizes: sizesArray,
      default_size: sizesArray[0] || null,
      description: formData.description.trim() || null,
      is_live_fish: formData.is_live_fish,
      published: formData.published,
      water_params: formData.is_live_fish
        ? {
            ph: formData.ph,
            temp: formData.temp,
            temperament: formData.temperament
          }
        : null
    }

    if (editingProduct) {
      // UPDATE
      const { error } = await updateProduct(editingProduct.id, payload)
      setFormSubmitting(false)

      if (error) {
        setFormError(`Update failed: ${error.message}`)
      } else {
        setEditModalOpen(false)
        setActionMessage({ type: 'success', text: `Product "${formData.name}" updated successfully.` })
        setTimeout(() => setActionMessage(null), 4000)
        loadAdminProducts()
        if (onProductUpdated) onProductUpdated()
      }
    } else {
      // CREATE
      const { error } = await createProduct(payload)
      setFormSubmitting(false)

      if (error) {
        setFormError(`Creation failed: ${error.message}`)
      } else {
        setEditModalOpen(false)
        setActionMessage({ type: 'success', text: `Product "${formData.name}" created successfully.` })
        setTimeout(() => setActionMessage(null), 4000)
        loadAdminProducts()
        if (onProductUpdated) onProductUpdated()
      }
    }
  }

  // Toggle Published Switch
  const handleTogglePublished = async (product) => {
    const newStatus = !product.published
    // Optimistic local update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, published: newStatus } : p))
    )

    const { error } = await updateProduct(product.id, { published: newStatus })
    if (error) {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: !newStatus } : p))
      )
      setActionMessage({ type: 'error', text: `Failed to update visibility: ${error.message}` })
    } else {
      setActionMessage({
        type: 'success',
        text: `Product is now ${newStatus ? 'Published (visible to customers)' : 'Draft (hidden from customers)'}.`
      })
      if (onProductUpdated) onProductUpdated()
    }
    setTimeout(() => setActionMessage(null), 3000)
  }

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setDeleteSubmitting(true)

    const { error } = await deleteProduct(productToDelete.id)
    setDeleteSubmitting(false)

    if (error) {
      setActionMessage({ type: 'error', text: `Failed to delete: ${error.message}` })
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setActionMessage({ type: 'success', text: `Product "${productToDelete.name}" deleted.` })
      if (onProductUpdated) onProductUpdated()
    }
    setDeleteModalOpen(false)
    setProductToDelete(null)
    setTimeout(() => setActionMessage(null), 3000)
  }

  // Copy Migration SQL helper
  const handleCopyMigrationSQL = () => {
    const sqlText = `-- Dolphin Aquarium Admin Setup
-- 1. Create admin table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND role = 'admin');
$$;`
    navigator.clipboard.writeText(sqlText)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 2500)
  }

  if (!isOpen) return null

  return (
    <div className="cart-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="admin-dashboard-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0b1329',
          color: '#f8fafc',
          borderRadius: '16px',
          width: '95%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          border: '1px solid #1e293b',
          overflow: 'hidden'
        }}
      >
        {/* ================================================================ */}
        {/* TOP HEADER BAR */}
        {/* ================================================================ */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Lock size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Dolphin Aquarium Admin Console
                </h3>
                <span
                  style={{
                    background: isUsingSupabase ? '#065f46' : '#854d0e',
                    color: isUsingSupabase ? '#6ee7b7' : '#fde047',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isUsingSupabase ? '#34d399' : '#facc15'
                    }}
                  />
                  {isUsingSupabase ? 'Supabase Live DB' : 'Sample Data Mode'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Stage 4: Secure Database Schema, Storage &amp; Admin Authentication
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {currentUser.email}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: isAdmin ? '#38bdf8' : '#f87171',
                      fontWeight: 700
                    }}
                  >
                    {isAdmin ? `✓ Verified Admin (${userRole || 'admin'})` : '✗ Not Registered as Admin'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1e293b',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: '9999px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Global Action Feedback Message */}
        {actionMessage && (
          <div
            style={{
              padding: '0.75rem 1.5rem',
              background: actionMessage.type === 'success' ? '#064e3b' : '#7f1d1d',
              color: actionMessage.type === 'success' ? '#a7f3d0' : '#fecaca',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* ================================================================ */}
        {/* MAIN BODY AREA */}
        {/* ================================================================ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* CASE 1: LOADING AUTH STATUS */}
          {authLoading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <RefreshCw
                size={32}
                className="animate-spin"
                style={{ color: '#38bdf8', margin: '0 auto 1rem auto' }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Verifying administrator authentication &amp; security policies...
              </p>
            </div>
          )}

          {/* CASE 2: NOT SIGNED IN -> LOGIN SCREEN */}
          {!authLoading && !currentUser && (
            <div style={{ maxWidth: '440px', margin: '1rem auto' }}>
              <div
                style={{
                  background: '#131e36',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  padding: '1.75rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto'
                    }}
                  >
                    <Shield size={24} color="#38bdf8" />
                  </div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
                    Administrator Sign In
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Access the protected catalog management dashboard
                  </p>
                </div>

                {loginError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        marginBottom: '0.35rem'
                      }}
                    >
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@dolphinaquarium.com"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        marginBottom: '0.35rem'
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginSubmitting || !isSupabaseConfigured}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: loginSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
                    }}
                  >
                    {loginSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Sign In as Admin</span>
                      </>
                    )}
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #1e293b',
                    textAlign: 'center'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowMigrationHelp(!showMigrationHelp)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{showMigrationHelp ? 'Hide' : 'Show'} Stage 4 Setup Instructions</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Collapsible Migration Help */}
              {showMigrationHelp && (
                <div
                  style={{
                    marginTop: '1rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    color: '#94a3b8'
                  }}
                >
                  <h5 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '0.85rem' }}>
                    How to create your first Admin in Supabase:
                  </h5>
                  <ol style={{ paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
                    <li>
                      Run the Stage 4 migration file (<code>supabase/migrations/20261022000001_create_dolphin_aquarium_schema.sql</code>) in your Supabase SQL Editor.
                    </li>
                    <li>
                      Go to Supabase <strong>Authentication &rarr; Users</strong> and click <strong>Add User &rarr; Create User</strong> with your chosen admin email and password.
                    </li>
                    <li>
                      Copy the generated User UUID and grant it admin permissions via SQL:
                      <pre
                        style={{
                          background: '#020617',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          overflowX: 'auto',
                          marginTop: '0.25rem'
                        }}
                      >
                        {`INSERT INTO public.admin_users (user_id, role)\nVALUES ('<YOUR_USER_UUID>', 'admin');`}
                      </pre>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* CASE 3: SIGNED IN BUT NOT ADMIN IN admin_users */}
          {!authLoading && currentUser && !isAdmin && (
            <div
              style={{
                maxWidth: '600px',
                margin: '2rem auto',
                background: '#131e36',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <AlertTriangle size={28} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#f87171' }}>
                Admin Privilege Required
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                Your account <strong>{currentUser.email}</strong> is authenticated, but has not been granted administrator privileges in the database.
              </p>
              <div
                style={{
                  background: '#0a0f1d',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'left',
                  marginBottom: '1.25rem',
                  border: '1px solid #1e293b'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Your Supabase User ID:
                </div>
                <code style={{ color: '#38bdf8', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  {currentUser.id}
                </code>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                  Run this SQL in your Supabase SQL Editor to grant admin access:
                </div>
                <pre
                  style={{
                    margin: 0,
                    background: '#020617',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    color: '#a7f3d0',
                    fontSize: '0.78rem',
                    overflowX: 'auto'
                  }}
                >
                  {`INSERT INTO public.admin_users (user_id, role)\nVALUES ('${currentUser.id}', 'admin')\nON CONFLICT (user_id) DO UPDATE SET role = 'admin';`}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={async () => {
                    const check = await checkIsAdmin(currentUser.id)
                    setIsAdmin(check.isAdmin)
                    setUserRole(check.role)
                    if (check.isAdmin) {
                      loadAdminProducts()
                    }
                  }}
                  style={{
                    background: '#0284c7',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Check Permissions Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    background: '#334155',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* CASE 4: AUTHENTICATED AND VERIFIED ADMIN -> FULL MANAGEMENT CONSOLE */}
          {!authLoading && currentUser && isAdmin && (
            <div>
              {/* 1. Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div
                  style={{
                    background: '#131e36',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(2, 132, 199, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Package size={22} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Products</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                      {metrics.total}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#131e36',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle2 size={22} color="#34d399" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>In Stock</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                      {metrics.inStock}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#131e36',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Fish size={22} color="#fbbf24" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Fish Varieties</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                      {metrics.liveFish}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#131e36',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Eye size={22} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Publicly Published</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                      {metrics.published}
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Notice if table not in Supabase yet */}
              {!isUsingSupabase && (
                <div
                  style={{
                    background: '#422006',
                    border: '1px solid #ca8a04',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <AlertTriangle size={20} color="#facc15" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fef08a', fontSize: '0.85rem' }}>
                        Supabase database table `public.products` not yet applied.
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#fde047' }}>
                        Run the SQL migration script in your Supabase SQL Editor to save products to PostgreSQL.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMigrationSQL}
                    style={{
                      background: '#ca8a04',
                      border: 'none',
                      color: '#000000',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{sqlCopied ? 'SQL Copied!' : 'Copy Migration SQL'}</span>
                  </button>
                </div>
              )}

              {/* 2. Controls & Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                        borderRadius: '8px',
                        background: '#131e36',
                        border: '1px solid #1e293b',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#131e36',
                      border: '1px solid #1e293b',
                      color: '#cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="all">All Categories</option>
                    <option value="Goldfish">Goldfish</option>
                    <option value="Betta Fish">Betta Fish</option>
                    <option value="Motors & Pumps">Motors &amp; Pumps</option>
                    <option value="Fish Food">Fish Food</option>
                    <option value="Aquarium Bowls">Aquarium Bowls</option>
                    <option value="Fish Medicines">Fish Medicines</option>
                  </select>

                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: '#131e36',
                      border: '1px solid #1e293b',
                      color: '#cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={loadAdminProducts}
                    disabled={productsLoading}
                    title="Refresh Product List"
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#cbd5e1',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={14} className={productsLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* 3. Products Table */}
              <div
                style={{
                  background: '#131e36',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  overflow: 'hidden'
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Price (₹)</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Stock</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Store Visibility</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                            No products match your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const isInStock = product.stock > 0
                          const isPub = product.published !== false

                          return (
                            <tr
                              key={product.id}
                              style={{
                                borderBottom: '1px solid #1e293b',
                                transition: 'background 0.2s'
                              }}
                            >
                              {/* Product Info */}
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <img
                                    src={product.primary_image || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=120&q=80'}
                                    alt={product.name}
                                    style={{
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '8px',
                                      objectFit: 'cover',
                                      border: '1px solid #1e293b'
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                                      {product.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                      {product.variety || product.sub_category || 'Standard Variety'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span
                                  style={{
                                    background: '#1e293b',
                                    color: '#cbd5e1',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {product.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                                  ₹{product.price}
                                </div>
                                {product.original_price && (
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'line-through' }}>
                                    ₹{product.original_price}
                                  </div>
                                )}
                              </td>

                              {/* Stock */}
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: isInStock ? '#34d399' : '#f87171'
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: isInStock ? '#34d399' : '#f87171'
                                    }}
                                  />
                                  {isInStock ? `${product.stock} units` : 'Out of Stock'}
                                </span>
                              </td>

                              {/* Published Toggle */}
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublished(product)}
                                  title={isPub ? 'Click to unpublish (hide)' : 'Click to publish (show)'}
                                  style={{
                                    background: isPub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                                    color: isPub ? '#34d399' : '#94a3b8',
                                    border: `1px solid ${isPub ? '#10b981' : '#475569'}`,
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isPub ? <Eye size={12} /> : <EyeOff size={12} />}
                                  <span>{isPub ? 'Published' : 'Hidden Draft'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(product)}
                                    title="Edit Product"
                                    style={{
                                      background: '#1e293b',
                                      border: '1px solid #334155',
                                      color: '#38bdf8',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductToDelete(product)
                                      setDeleteModalOpen(true)
                                    }}
                                    title="Delete Product"
                                    style={{
                                      background: '#1e293b',
                                      border: '1px solid #334155',
                                      color: '#f87171',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* SUB-MODAL 1: ADD / EDIT PRODUCT */}
        {/* ================================================================ */}
        {editModalOpen && (
          <div
            className="cart-backdrop"
            style={{ zIndex: 130 }}
            onClick={() => setEditModalOpen(false)}
          >
            <div
              className="admin-edit-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                margin: 'auto',
                border: '1px solid #334155',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #1e293b',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Aquarium Product'}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    background: '#1e293b',
                    border: 'none',
                    color: '#94a3b8',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {formError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                    color: '#fca5a5'
                  }}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProduct}>
                {/* Product Name */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Red Cap Oranda Goldfish"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: '#0a0f1d',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Category & Section Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Goldfish">Goldfish</option>
                      <option value="Betta Fish">Betta Fish</option>
                      <option value="Motors & Pumps">Motors &amp; Pumps</option>
                      <option value="Fish Food">Fish Food</option>
                      <option value="Aquarium Bowls">Aquarium Bowls</option>
                      <option value="Fish Medicines">Fish Medicines</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Homepage Section
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="livestock">Curated Exotic Arrivals (Livestock)</option>
                      <option value="motors">Motors &amp; Pumps</option>
                      <option value="food">Fish Food &amp; Nutrition</option>
                      <option value="essentials">Tanks &amp; Care Essentials</option>
                    </select>
                  </div>
                </div>

                {/* Subcategory & Variety */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Sub-Category
                    </label>
                    <input
                      type="text"
                      value={formData.sub_category}
                      onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                      placeholder="e.g. Oranda / Internal Filter"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Variety / Badge
                    </label>
                    <input
                      type="text"
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      placeholder="e.g. Red Cap / BIO Filtration"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Price, MRP, Stock Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="80.00"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Original Price (MRP)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="100.00"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="10"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Image Upload & URL */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Product Image
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formData.primary_image}
                      onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                      placeholder="https://... or upload a file"
                      style={{
                        flex: 1,
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        background: '#0a0f1d',
                        border: '1px solid #334155',
                        color: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#38bdf8',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: imageUploading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {imageUploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span>{imageUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {formData.primary_image && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={formData.primary_image}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview thumbnail</span>
                    </div>
                  )}
                </div>

                {/* Available Sizes / Variants */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Size Variants (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="e.g. 3.5 inch, 4.5 inch, 5.5 inch Jumbo"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: '#0a0f1d',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Live Fish Parameters Toggle */}
                <div
                  style={{
                    marginBottom: '1rem',
                    background: '#131e36',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #1e293b'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: formData.is_live_fish ? '0.75rem' : '0' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_live_fish}
                      onChange={(e) => setFormData({ ...formData, is_live_fish: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>This is Live Ornamental Fish (show water quality care specs)</span>
                  </label>

                  {formData.is_live_fish && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target pH</label>
                        <input
                          type="text"
                          value={formData.ph}
                          onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                          placeholder="7.2 - 7.6"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            background: '#0a0f1d',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Temperature</label>
                        <input
                          type="text"
                          value={formData.temp}
                          onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                          placeholder="20-24°C"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            background: '#0a0f1d',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Temperament</label>
                        <input
                          type="text"
                          value={formData.temperament}
                          onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
                          placeholder="Peaceful"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            background: '#0a0f1d',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about size, diet, quarantine status, or technical specifications..."
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      background: '#0a0f1d',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      boxSizing: 'border-box',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {/* Published Checkbox */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                      Publish Immediately (visible to customers on storefront)
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      color: '#cbd5e1',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: formSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {formSubmitting ? <RefreshCw size={16} className="animate-spin" /> : null}
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* SUB-MODAL 2: DELETE CONFIRMATION */}
        {/* ================================================================ */}
        {deleteModalOpen && productToDelete && (
          <div
            className="cart-backdrop"
            style={{ zIndex: 140 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '14px',
                width: '90%',
                maxWidth: '440px',
                padding: '1.5rem',
                margin: 'auto',
                border: '1px solid #ef4444',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <Trash2 size={24} color="#ef4444" />
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                Delete Product?
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                Are you sure you want to permanently remove <strong>{productToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#cbd5e1',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteSubmitting}
                  style={{
                    background: '#dc2626',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: deleteSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deleteSubmitting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
