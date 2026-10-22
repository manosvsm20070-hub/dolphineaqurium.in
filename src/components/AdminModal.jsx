import { AdminDashboard } from './AdminDashboard'

/**
 * AdminModal
 *
 * Wrapper around the complete AdminDashboard component to maintain
 * backwards compatibility with existing Header, Footer, and App components.
 */
export function AdminModal({ isOpen, onClose, onProductUpdated }) {
  return (
    <AdminDashboard
      isOpen={isOpen}
      onClose={onClose}
      onProductUpdated={onProductUpdated}
    />
  )
}
