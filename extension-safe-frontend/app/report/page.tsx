'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

// Shape of a single obfuscation detection returned by the backend
interface ObfuscationFlag {
  obfuscation: string
  severity: string
  explanation: string
}

// Full report object stored in localStorage after a successful /analyze call
interface Report {
  extension_name: string
  version: string
  description: string
  what_it_can_do: string[]
  network_calls: string[]
  match_patterns: string[]
  permission_score: number
  permission_flags: string
  ai_opinion: string | null
  obfuscation: {
    obfuscation: boolean
    flags: ObfuscationFlag[]
    explanation: string
  }
}

// ─── AI opinion card ──────────────────────────────────────────────────────────

// Renders the plain-text AI assessment in a blue-tinted card with a disclaimer note.
// Uses whiteSpace: pre-wrap so bullet points and line breaks from the model are preserved.
function AiOpinionCard({ text }: { text: string }) {
  return (
    <div style={{ background: 'white', border: '0.5px solid #bae6fd', borderRadius: '12px', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px', marginTop: 0 }}>
        AI Analysis
      </h2>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
        Based on the extension's stated purpose and detected permissions
      </p>
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
        <p style={{ fontSize: '11px', color: '#0369a1', lineHeight: '1.6', margin: 0 }}>
          <strong>Note:</strong> AI-generated analysis — highlights potential concerns but does not confirm malicious behavior.
        </p>
      </div>
      <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Exact domain suffixes that are always considered recognized/safe services
const KNOWN_SAFE_SUFFIXES = [
  'google.com', 'googleapis.com', 'github.com', 'microsoft.com',
  'mozilla.org', 'cloudflare.com', 'amazon.com', 'amazonaws.com',
  'apple.com', 'w3.org', 'jsdelivr.net', 'unpkg.com',
  'firebase.google.com', 'firebaseio.com', 'gstatic.com', 'youtube.com',
]
// Organization names recognized as safe regardless of TLD — catches google.ru, bing.de, etc.
const KNOWN_SAFE_BASES = new Set([
  'google', 'googleapis', 'github', 'microsoft', 'mozilla', 'cloudflare',
  'amazon', 'amazonaws', 'apple', 'jsdelivr', 'unpkg', 'firebase',
  'firebaseio', 'gstatic', 'youtube', 'azure', 'windows', 'bing',
])

// Multi-part TLD second-level labels (e.g. .co.jp, .com.au, .com.tr)
const GENERIC_SLD = new Set(['com', 'co', 'org', 'net', 'edu', 'gov', 'ac', 'ne'])

// Extracts the organization name from a domain, skipping generic SLDs.
// e.g. www.google.co.jp → "google", api.github.com → "github"
function getBaseDomain(domain: string): string {
  const parts = domain.split('.')
  if (parts.length < 2) return domain.toLowerCase()
  const sld = parts[parts.length - 2].toLowerCase()
  // If second-to-last is a generic label (com, co, …) the real org name is one further up
  if (GENERIC_SLD.has(sld) && parts.length >= 3) return parts[parts.length - 3].toLowerCase()
  return sld
}

// Returns everything before the TLD (handles .co.jp, .com.au, etc.)
function getNormalizedKey(domain: string): string {
  const parts = domain.split('.')
  if (parts.length < 2) return domain.toLowerCase()
  const sld = parts[parts.length - 2].toLowerCase()
  const tldStart = GENERIC_SLD.has(sld) && parts.length >= 3 ? parts.length - 2 : parts.length - 1
  return parts.slice(0, tldStart).join('.').toLowerCase()
}

// Returns true if a domain belongs to a known major service (exact suffix OR base org name match)
const isKnownSafe = (d: string) =>
  KNOWN_SAFE_SUFFIXES.some(s => d.endsWith(s)) || KNOWN_SAFE_BASES.has(getBaseDomain(d))

// Sorts domains so standard TLDs (.com, .org, .net) come before country TLDs —
// ensures the most recognizable variant is kept after deduplication
function preferCanonical(domains: string[]) {
  return [...domains].sort((a, b) => {
    const aCanon = /\.(com|org|net|io|dev)$/.test(a)
    const bCanon = /\.(com|org|net|io|dev)$/.test(b)
    if (aCanon && !bCanon) return -1
    if (!aCanon && bCanon) return 1
    return a.localeCompare(b)
  })
}

// For network calls: collapse all TLD variants of the same root (google.ru → google)
function deduplicateByBase(domains: string[]): string[] {
  const seen = new Set<string>()
  return preferCanonical(domains).filter(d => {
    const base = getBaseDomain(d)
    if (seen.has(base)) return false
    seen.add(base)
    return true
  })
}

// For match patterns: keep meaningful subdomains (docs.google, mail.google) but
// collapse regional TLD variants (www.google.de + www.google.fr → www.google.com)
function deduplicateMatchPatterns(domains: string[]): string[] {
  const seen = new Set<string>()
  return preferCanonical(domains).filter(d => {
    const key = getNormalizedKey(d)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Maps obfuscation severity string to badge background color, text color, and display label
const severityColor = (severity: string) => {
  if (severity === 'critical') return { bg: '#fde8e8', text: '#c53030', label: 'Critical' }
  if (severity === 'high')     return { bg: '#fef3c7', text: '#92400e', label: 'High' }
  return { bg: '#e0f2fe', text: '#0369a1', label: 'Medium' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Reads the saved report from localStorage on mount and renders all analysis sections:
// header, capabilities, permission flags, obfuscation, network calls, match patterns, AI opinion.
// Redirects to home if no report is found (e.g. direct URL visit with no prior analysis).
export default function Report() {
  const [report, setReport] = useState<Report | null>(null)
  const [showAI, setShowAI] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('extensionReport')
    if (stored) setReport(JSON.parse(stored))
    else router.push('/')
  }, [])

  if (!report) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b7280' }}>Loading report...</p>
    </div>
  )

  const flags         = report.permission_flags
    ? [...new Set(report.permission_flags.split('\n').filter(f => f.trim()))]
    : []
  const networkCalls  = deduplicateByBase(report.network_calls ?? [])
  const matchPatterns = deduplicateMatchPatterns(report.match_patterns ?? [])
  const safeNetworkCalls   = networkCalls.filter(isKnownSafe)
  const unknownNetworkCalls = networkCalls.filter(d => !isKnownSafe(d))

  return (
    <main style={{ background: '#f8fafc', padding: '2.5rem 1.5rem', flex: 1 }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '13px', padding: '6px 12px', borderRadius: '8px', fontWeight: '500' }}
        >
          ← Analyze another
        </button>

        {/* Header */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            {report.extension_name}
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: report.description ? '8px' : 0 }}>
            Version {report.version}
          </p>
          {report.description && (
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{report.description}</p>
          )}
        </div>

        {/* What it can access */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
            What this extension can access on your computer
          </h2>
          {report.what_it_can_do.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>No significant capabilities detected</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.what_it_can_do.map((cap, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '0.5px solid #e5e7eb' }}>
                  <span style={{ fontSize: '14px', marginTop: '1px' }}>→</span>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', margin: 0 }}>{cap}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it uses its permissions */}
        {flags.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
              How it uses its permissions
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>
              Behaviors found in the extension code that relate to its requested permissions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {flags.map((flag, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '0.5px solid #e5e7eb' }}>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5', margin: 0 }}>{flag}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Obfuscation */}
        {report.obfuscation.obfuscation && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
              Parts of this code can't be fully reviewed
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>
              This extension uses {report.obfuscation.flags.length} technique{report.obfuscation.flags.length > 1 ? 's' : ''} that make the code harder to read and verify.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.obfuscation.flags.map((flag, i) => {
                const colors = severityColor(flag.severity)
                return (
                  <div key={i} style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', border: '0.5px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: colors.bg, color: colors.text, fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '999px' }}>
                        {colors.label}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>
                        {flag.obfuscation.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{flag.explanation}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* External connections */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
            External connections
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>
            Servers this extension contacts in its code — actual network calls, not just URL references
          </p>
          {networkCalls.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>No outbound network calls detected</p>
          ) : (
            <>
              {unknownNetworkCalls.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Other servers</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {unknownNetworkCalls.map((domain, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '8px', border: '0.5px solid #e5e7eb' }}>
                        <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>{domain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {safeNetworkCalls.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recognized services</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {safeNetworkCalls.map((domain, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: '#f3f4f6', color: '#374151', borderRadius: '999px', fontSize: '12px', fontFamily: 'monospace', border: '0.5px solid #e5e7eb' }}>
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Websites it runs on */}
        {matchPatterns.length > 0 && (
          <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
              Websites this extension runs on
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>
              Sites where this extension injects code and can read the page
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchPatterns.map((domain, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#f3f4f6', color: '#374151', borderRadius: '999px', fontSize: '12px', fontFamily: 'monospace', border: '0.5px solid #e5e7eb' }}>
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Opinion — always show button; handle null / old-string / new-object */}
        <div style={{ marginBottom: '1rem' }}>
          {!showAI ? (
            <button
              onClick={() => setShowAI(true)}
              style={{ width: '100%', padding: '12px', background: 'white', border: '0.5px solid #bae6fd', borderRadius: '12px', fontSize: '14px', color: '#0369a1', cursor: 'pointer', fontWeight: '500' }}
            >
              Show AI analysis →
            </button>
          ) : !report.ai_opinion ? (
            <div style={{ padding: '1.25rem', background: 'white', border: '0.5px solid #e5e7eb', borderRadius: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                AI analysis unavailable — make sure Ollama is running, then re-analyze this extension.
              </p>
            </div>
          ) : (
            <AiOpinionCard text={
              typeof report.ai_opinion === 'string'
                ? report.ai_opinion
                // old JSON-object format still in localStorage — extract readable text
                : (report.ai_opinion as any)?.summary
                  || (report.ai_opinion as any)?.verdict
                  || 'Re-analyze this extension to see the AI assessment.'
            } />
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '2rem' }}>
          Extension Safe analyzes publicly available extension code. This report shows what an extension is capable of — not necessarily what it is currently doing.
        </p>

      </div>
    </main>
  )
}
