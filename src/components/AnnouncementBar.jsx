import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { STORE_INFO } from '../data/storeInfo'

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !STORE_INFO.announcement.enabled) return null

  return (
    <aside
      aria-label="Shop Announcement"
      className="w-full bg-gradient-to-r from-[#006572] via-[#00525d] to-[#006572] text-white text-xs font-semibold py-2 px-4 flex items-center justify-between gap-3 relative z-50 border-b border-white/10"
      style={{
        background: 'linear-gradient(90deg, #006572 0%, #00505a 50%, #006572 100%)',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flex: 1,
          flexWrap: 'wrap',
          textAlign: 'center',
        }}
      >
        <span>{STORE_INFO.announcement.text}</span>
        <a
          href={STORE_INFO.announcement.linkUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(255, 255, 255, 0.18)',
            padding: '0.15rem 0.65rem',
            borderRadius: '9999px',
            color: '#ffffff',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.75rem',
          }}
        >
          <span>{STORE_INFO.announcement.linkText}</span>
          <ArrowRight size={13} />
        </a>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          padding: '0.2rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>
    </aside>
  )
}
