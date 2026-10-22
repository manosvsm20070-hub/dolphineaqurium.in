import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '../lib/supabase'

export function SupabaseStatus() {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(true)

  async function runCheck() {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
    } catch {
      setTestResult({
        success: false,
        status: 'error',
        message: 'Unexpected error during connection test.',
        details: 'Check browser developer console for more information.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    testSupabaseConnection()
      .then((result) => {
        if (isMounted) {
          setTestResult(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTestResult({
            success: false,
            status: 'error',
            message: 'Unexpected error during connection test.',
            details: 'Check browser developer console for more information.',
          })
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.badge(testResult?.success, loading)}>
            {loading ? 'Testing...' : testResult?.success ? 'Connected' : 'Action Required'}
          </span>
          <h2 style={styles.heading}>Supabase Setup Status</h2>
        </div>
        <button
          type="button"
          onClick={runCheck}
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Checking...' : 'Retest Connection'}
        </button>
      </div>

      <div style={styles.body}>
        {loading ? (
          <p style={styles.textMuted}>Testing connection to your Supabase project...</p>
        ) : (
          <>
            <p style={styles.message(testResult?.success)}>
              {testResult?.message}
            </p>
            {testResult?.details && (
              <p style={styles.details}>{testResult.details}</p>
            )}

            {!testResult?.success && testResult?.status === 'missing_config' && (
              <div style={styles.infoBox}>
                <p style={styles.infoTitle}>Setup Instructions:</p>
                <ol style={styles.list}>
                  <li>
                    Create a <code>.env.local</code> file in your project root folder.
                  </li>
                  <li>
                    Add your credentials from Supabase Dashboard (Settings &rarr; API):
                    <pre style={styles.codeBlock}>
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key`}
                    </pre>
                  </li>
                  <li>Restart the dev server (or reload this page).</li>
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    maxWidth: '680px',
    margin: '2rem auto',
    padding: '1.5rem',
    borderRadius: '12px',
    background: '#131e2e',
    color: '#e2e8f0',
    border: '1px solid #1e3a5f',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    textAlign: 'left',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '0.75rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  heading: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  badge: (isSuccess, isLoading) => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    borderRadius: '9999px',
    background: isLoading ? '#334155' : isSuccess ? '#065f46' : '#991b1b',
    color: isLoading ? '#cbd5e1' : isSuccess ? '#6ee7b7' : '#fca5a5',
  }),
  button: {
    background: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '0.45rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background 0.2s',
  },
  body: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  textMuted: {
    color: '#94a3b8',
    margin: 0,
  },
  message: (isSuccess) => ({
    margin: '0 0 0.5rem 0',
    fontWeight: '600',
    color: isSuccess ? '#34d399' : '#f87171',
  }),
  details: {
    color: '#cbd5e1',
    margin: '0 0 1rem 0',
    fontSize: '0.875rem',
  },
  infoBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
  },
  infoTitle: {
    margin: '0 0 0.5rem 0',
    fontWeight: '600',
    color: '#93c5fd',
  },
  list: {
    margin: '0',
    paddingLeft: '1.25rem',
    color: '#cbd5e1',
    fontSize: '0.85rem',
  },
  codeBlock: {
    background: '#020617',
    color: '#38bdf8',
    padding: '0.6rem',
    borderRadius: '6px',
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    overflowX: 'auto',
  },
}
