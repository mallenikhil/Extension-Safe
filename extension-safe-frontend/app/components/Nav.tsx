'use client'
import Link from 'next/link'

// Sticky frosted-glass navbar — logo links to home, right side has Learn, About, and GitHub
export default function Nav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 1.5rem',
        height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: '#0f172a',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 1L13.5 4.5V10.5L7.5 14L1.5 10.5V4.5L7.5 1Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
              <circle cx="7.5" cy="7.5" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Extension Safe
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link href="/learn" style={{
            fontSize: '14px', color: '#64748b', textDecoration: 'none',
            padding: '6px 12px', borderRadius: '8px',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            Learn
          </Link>
          <Link href="/about" style={{
            fontSize: '14px', color: '#64748b', textDecoration: 'none',
            padding: '6px 12px', borderRadius: '8px',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
          >
            About
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: '500',
              color: '#0f172a',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '6px 14px', borderRadius: '8px',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}