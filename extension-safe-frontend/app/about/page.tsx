import Link from 'next/link'

// Static about page — explains what Extension Safe does, how each analysis step works,
// what it cannot do, a Chrome permission reference table, and a CTA back to the analyzer
export default function About() {
  return (
    <main style={{
      background: '#f8fafc',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1.25rem, 4vw, 2.5rem)',
        boxSizing: 'border-box',
      }}>

        {/* Hero */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3rem)',
          textAlign: 'center',
          marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          <p style={{
            fontSize: 'clamp(11px, 1vw, 13px)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            color: '#94a3b8',
            marginBottom: '1rem',
          }}>
            About Extension Safe
          </p>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1.15',
            letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
            maxWidth: '680px',
            margin: '0 auto 1.25rem',
          }}>
            Browser extensions are the most overlooked security risk on your computer
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
            color: '#64748b',
            lineHeight: '1.75',
            maxWidth: '580px',
            margin: '0 auto',
          }}>
            Extension Safe was built to give non-technical users a clear, honest picture of what any Chrome extension can actually do — before or after installing it.
          </p>
        </section>

        {/* What it is */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            What Extension Safe does
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.1vw, 15px)',
            color: '#64748b',
            lineHeight: '1.75',
            marginBottom: '1rem',
          }}>
            Paste any Chrome Web Store URL and Extension Safe downloads the extension package directly from Google, reads its code, and produces a plain-English report covering:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Every permission the extension requests and what it actually allows',
              'Which external servers the extension contacts in its code',
              'Which websites the extension injects code into and can read',
              'Whether the extension uses code obfuscation techniques to hide its behavior',
              "An AI-generated assessment of whether the permissions match the extension's stated purpose",
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: 'clamp(10px, 1.2vw, 14px) clamp(12px, 1.4vw, 16px)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}>
                <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>✓</span>
                <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', color: '#374151', lineHeight: '1.55', margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How the analysis works */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            How the analysis works
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.1vw, 15px)',
            color: '#64748b',
            lineHeight: '1.75',
            marginBottom: '1.5rem',
          }}>
            Every report is built from five separate analyses run against the extension package.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {[
              {
                number: '01',
                title: 'Permission analysis',
                body: "The extension's manifest.json declares which Chrome APIs it can use. Extension Safe maps each permission to what it actually enables — for example, the cookies permission lets an extension read login sessions from every website you visit.",
              },
              {
                number: '02',
                title: 'Network call detection',
                body: "The JavaScript files are scanned for actual fetch(), XMLHttpRequest, and WebSocket calls. This only reports domains where the extension actively sends data — unknown domains are listed separately from recognized services.",
              },
              {
                number: '03',
                title: 'Content script mapping',
                body: "Extensions declare which websites they inject code into via content_scripts match patterns. Extension Safe extracts these patterns and lists the sites where the extension runs and can read or modify page content.",
              },
              {
                number: '04',
                title: 'Code obfuscation detection',
                body: "The JavaScript code is scanned for techniques used to hide behavior: hex-encoded strings, eval() usage, base64 runtime decoding, and deeply nested functions. Legitimate extensions have no reason to use these. Each technique is labeled by severity.",
              },
              {
                number: '05',
                title: 'AI permission assessment',
                body: "A locally-running Ollama/LLaMA model is given the extension's stated purpose alongside its detected permissions and network calls. It assesses whether the access the extension requests is proportionate to what it claims to do.",
              },
            ].map(({ number, title, body }) => (
              <div key={number} style={{ padding: 'clamp(0.9rem, 1.5vw, 1.25rem) clamp(1.1rem, 2vw, 1.5rem)', background: 'white' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.04em', minWidth: '22px', marginTop: '3px' }}>{number}</span>
                  <div>
                    <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', fontWeight: '600', color: '#0f172a', marginBottom: '5px' }}>{title}</p>
                    <p style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#64748b', lineHeight: '1.7', margin: 0 }}>{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What it doesn't do */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            What Extension Safe does not do
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.1vw, 15px)',
            color: '#64748b',
            lineHeight: '1.75',
            marginBottom: '1.25rem',
          }}>
            Understanding the limits of this tool is just as important as understanding what it finds.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                title: 'It does not monitor extensions at runtime',
                body: 'The analysis is static — it reads the code published to the Chrome Web Store at the time of the request. It cannot observe what an extension actually does while it runs in your browser.',
              },
              {
                title: 'It does not prove malicious intent',
                body: 'Having broad permissions or contacting external servers is not proof that an extension is malicious. Many legitimate extensions need wide access. The report shows capability, not confirmed behavior.',
              },
              {
                title: 'It does not catch server-side attacks',
                body: 'Some extension attacks involve a legitimate extension talking to a compromised backend. Extension Safe can show you which servers an extension calls, but cannot assess what those servers do in response.',
              },
              {
                title: 'It does not replace reviewing the extension yourself',
                body: "For extensions with access to sensitive sites, there is no substitute for reading the extension's privacy policy, checking its developer's public presence, and reviewing recent user reviews.",
              },
            ].map(({ title, body }, i) => (
              <div key={i} style={{
                padding: 'clamp(12px, 1.3vw, 16px) clamp(14px, 1.5vw, 18px)',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', fontWeight: '600', color: '#0f172a', marginBottom: '5px' }}>{title}</p>
                <p style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#64748b', lineHeight: '1.65', margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Permissions glossary */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            Chrome permission reference
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.1vw, 15px)',
            color: '#64748b',
            lineHeight: '1.75',
            marginBottom: '1.25rem',
          }}>
            These are the permissions Extension Safe flags and what they mean in practice.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {[
              { perm: 'cookies',         risk: 'HIGH',   meaning: 'Read and write cookies from any website — including login sessions and authentication tokens.' },
              { perm: '<all_urls>',       risk: 'HIGH',   meaning: 'Access every website you visit without restriction.' },
              { perm: 'webRequest',       risk: 'HIGH',   meaning: 'Intercept, read, and modify network requests before they leave your browser.' },
              { perm: 'management',       risk: 'HIGH',   meaning: 'List, disable, enable, or uninstall other extensions installed in your browser.' },
              { perm: 'scripting',        risk: 'HIGH',   meaning: 'Inject JavaScript into web pages you visit — can read forms, capture keystrokes, and modify page content.' },
              { perm: 'tabs',             risk: 'MEDIUM', meaning: 'See the URL, title, and status of every open tab in real time.' },
              { perm: 'history',          risk: 'MEDIUM', meaning: 'Read your full browsing history including every URL you have ever visited.' },
              { perm: 'clipboardRead',    risk: 'MEDIUM', meaning: 'Read the current contents of your clipboard, including anything you copy.' },
              { perm: 'downloads',        risk: 'MEDIUM', meaning: 'Access your download history and initiate or cancel downloads.' },
              { perm: 'storage',          risk: 'LOW',    meaning: 'Store data locally in your browser. Not inherently dangerous but can be used to persist collected data.' },
              { perm: 'notifications',    risk: 'LOW',    meaning: 'Display browser notifications. No access to your data.' },
              { perm: 'alarms',           risk: 'LOW',    meaning: 'Schedule code to run at intervals. Useful for background tasks.' },
              { perm: 'nativeMessaging',  risk: 'HIGH',   meaning: 'Communicate with programs installed on your computer outside the browser entirely.' },
            ].map(({ perm, risk, meaning }) => {
              const isHigh   = risk === 'HIGH'
              const isMed    = risk === 'MEDIUM'
              const badgeBg  = isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#f0fdf4'
              const badgeTxt = isHigh ? '#dc2626' : isMed ? '#d97706' : '#16a34a'
              return (
                <div key={perm} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'clamp(10px, 1.2vw, 14px)',
                  padding: 'clamp(10px, 1.2vw, 13px) clamp(12px, 1.5vw, 16px)',
                  background: 'white',
                }}>
                  <code style={{
                    fontSize: 'clamp(11px, 0.9vw, 13px)',
                    fontFamily: 'monospace',
                    color: '#374151',
                    minWidth: 'clamp(90px, 10vw, 130px)',
                    flexShrink: 0,
                    paddingTop: '2px',
                  }}>{perm}</code>
                  <span style={{
                    fontSize: 'clamp(9px, 0.8vw, 11px)',
                    fontWeight: '600',
                    background: badgeBg,
                    color: badgeTxt,
                    borderRadius: '999px',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {risk}
                  </span>
                  <p style={{ fontSize: 'clamp(12px, 1vw, 14px)', color: '#64748b', lineHeight: '1.55', margin: 0 }}>{meaning}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: 'white',
          border: '1px solid #f1f5f9',
          borderRadius: '16px',
          padding: 'clamp(2rem, 4vw, 3.5rem)',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '0.75rem',
          }}>
            Ready to check an extension?
          </h2>
          <p style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', color: '#64748b', marginBottom: '1.5rem' }}>
            Paste any Chrome Web Store URL and get a full report in seconds.
          </p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#0f172a', color: 'white',
            fontSize: 'clamp(13px, 1.1vw, 15px)', fontWeight: '600',
            padding: 'clamp(10px, 1.3vw, 13px) clamp(20px, 2.5vw, 28px)',
            borderRadius: '10px',
            textDecoration: 'none',
          }}>
            Analyze an extension →
          </Link>
        </section>

      </div>
    </main>
  )
}
