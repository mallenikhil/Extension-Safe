'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Home page — URL input, triggers analysis, stores result in localStorage, navigates to /report
export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // POSTs the Chrome Web Store URL to the FastAPI backend, saves the JSON report to
  // localStorage, then navigates to /report. Times out after 60 s to handle slow downloads.
  const analyze = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/analyze?url=${encodeURIComponent(url)}`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(60000),
        }
      )
      if (!response.ok) throw new Error('Failed to analyze this extension')
      const data = await response.json()
      if (data.status === 'error') {
        setError(data.message)
        return
      }
      localStorage.setItem('extensionReport', JSON.stringify(data))
      router.push('/report')
    } catch {
      setError('Could not reach the backend — make sure it\'s running')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem 4rem',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#f1f5f9', border: '1px solid #e2e8f0',
          borderRadius: '999px', padding: '4px 12px',
          fontSize: '12px', fontWeight: '500', color: '#475569',
          marginBottom: '2rem',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Free & open analysis — no account needed
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          color: '#0f172a',
          textAlign: 'center',
          lineHeight: '1.15',
          letterSpacing: '-0.03em',
          maxWidth: '680px',
          marginBottom: '1.25rem',
        }}>
          Know exactly what your browser extensions do
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#64748b',
          textAlign: 'center',
          maxWidth: '520px',
          lineHeight: '1.7',
          marginBottom: '2.5rem',
        }}>
          Paste any Chrome Web Store URL and get a plain-English breakdown of its permissions,
          network connections, and code behavior — in seconds.
        </p>

        {/* Input */}
        <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') analyze() }}
              placeholder="https://chromewebstore.google.com/detail/..."
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                background: 'white',
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#94a3b8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,163,184,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
              }}
            />
            <button
              onClick={analyze}
              disabled={loading || url === ''}
              style={{
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#475569' : '#0f172a',
                border: 'none',
                borderRadius: '10px',
                cursor: loading || url === '' ? 'not-allowed' : 'pointer',
                opacity: url === '' ? 0.5 : 1,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s, opacity 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { if (!loading && url) e.currentTarget.style.background = '#1e293b' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0f172a' }}
            >
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>{error}</p>
          )}
        </div>

        {/* Trust chips */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          justifyContent: 'center',
          marginTop: '1.75rem',
        }}>
          {[
            'No data stored',
            'Reads from Chrome Web Store only',
            'Open extension code analysis',
          ].map(t => (
            <span key={t} style={{
              fontSize: '12px', color: '#94a3b8',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '999px',
              padding: '4px 12px',
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        padding: '5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px', fontWeight: '600', color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            textAlign: 'center', marginBottom: '12px',
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: '700', color: '#0f172a',
            textAlign: 'center', letterSpacing: '-0.02em',
            marginBottom: '3.5rem',
          }}>
            Three steps to full transparency
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: '01',
                title: 'Paste the URL',
                body: 'Drop in any Chrome Web Store link. We fetch the extension package directly from Google.',
              },
              {
                step: '02',
                title: 'We read the code',
                body: 'The manifest, permissions, JavaScript files, and network calls are all extracted and analyzed.',
              },
              {
                step: '03',
                title: 'You get the truth',
                body: 'A plain-English report shows exactly what the extension can access, where it sends data, and whether its code can be reviewed.',
              },
            ].map(item => (
              <div key={item.step} style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.75rem',
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: '700', color: '#cbd5e1',
                  letterSpacing: '0.05em', display: 'block', marginBottom: '12px',
                }}>
                  {item.step}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.65', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #f1f5f9',
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Extension Safe — built for curious users who want to know what they&apos;re installing
        </p>
      </footer>
    </>
  )
}