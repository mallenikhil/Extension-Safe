'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── Motion config ────────────────────────────────────────────────────────────

const TOTAL = 8

const variants = {
  enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit:  (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}
const ease = [0.32, 0, 0.67, 0] as [number, number, number, number]
const transition = { duration: 0.4, ease }

// ─── Shared helpers ───────────────────────────────────────────────────────────

// Small uppercase section label shown above each slide heading (e.g. "01 — the problem")
function Label({ children }: { children: string }) {
  return (
    <p className="text-[10px] sm:text-xs lg:text-sm font-semibold tracking-[0.12em] text-slate-400 uppercase">
      {children}
    </p>
  )
}

// Primary h1 for each slide — fluid type scale from mobile through 2xl
function Heading({ children }: { children: string }) {
  return (
    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
      {children}
    </h1>
  )
}

// Lead paragraph below the heading — slightly muted, relaxed line-height
function Body({ children }: { children: string }) {
  return (
    <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-500 leading-relaxed">
      {children}
    </p>
  )
}

// ─── Slides ───────────────────────────────────────────────────────────────────

// Slide 1 — The problem: stats on how many users have extensions and how many were hit by malicious ones
function Slide1() {
  return (
    <>
      <Label>01 — the problem</Label>
      <Heading>You probably have no idea what your extensions are doing</Heading>
      <Body>
        The average Chrome user has 8 extensions installed. Each one runs silently in the
        background with direct access to everything you do in your browser. Most people click
        Add to Chrome in under 10 seconds without reading a single permission.
      </Body>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
        {[
          { stat: '8',    label: 'avg extensions installed per Chrome user' },
          { stat: '3.8B', label: 'Chrome users worldwide' },
          { stat: '5.8M', label: 'people hit by malicious extensions in 2024 alone' },
        ].map(({ stat, label }) => (
          <div key={stat} className="border border-slate-200 rounded-xl p-6 sm:p-7 lg:p-9 xl:p-11 bg-white">
            <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 tracking-tight mb-2 lg:mb-3">{stat}</p>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-400 leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </>
  )
}

// Slide 2 — How extensions work: content scripts, background service worker, Chrome APIs
function Slide2() {
  const cards = [
    {
      title: 'Content scripts',
      desc: 'Code injected directly into web pages you visit. Can read and modify anything on the page including forms, passwords, and text you type.',
    },
    {
      title: 'Background service worker',
      desc: 'Runs permanently in the background even when you are not using the extension. Coordinates all the extension\'s activity including sending data externally.',
    },
    {
      title: 'Chrome APIs',
      desc: 'Special browser APIs only extensions can access. Give extensions powers far beyond what a normal website can do.',
    },
  ]
  return (
    <>
      <Label>02 — how extensions work</Label>
      <Heading>Extensions sit between you and every website you visit</Heading>
      <Body>
        Unlike a normal app that only runs when you open it, a Chrome extension runs continuously
        in the background the moment Chrome starts. It can watch every tab you open, intercept
        network requests before they leave your device, and read the content of every page you
        visit — including pages you are actively typing on.
      </Body>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
        {cards.map(({ title, desc }) => (
          <div key={title} className="border border-slate-200 rounded-xl px-6 py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12 bg-white">
            <p className="font-semibold text-slate-900 text-sm sm:text-base lg:text-lg xl:text-xl mb-3 lg:mb-4">{title}</p>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}

// Slide 3 — Chrome API capabilities: what cookies, webRequest, scripting etc. can actually do
function Slide3() {
  const apis = [
    { name: 'cookies',         desc: 'Read login sessions from your bank, email, and social accounts simultaneously. Send them to an attacker who can log in as you without needing your password.' },
    { name: 'webRequest',      desc: 'Intercept every network request before it leaves your device. Read form data including passwords and credit card numbers as you type them into websites.' },
    { name: 'tabs',            desc: 'See every URL you visit in real time including private tabs. Build a complete profile of your browsing habits, health searches, and financial activity.' },
    { name: 'scripting',       desc: 'Inject code into any webpage you visit. Silently modify what you see — change bank balances, redirect payments, or add invisible keyloggers to login forms.' },
    { name: 'clipboardRead',   desc: 'Read anything you copy including passwords from password managers, cryptocurrency wallet addresses, and sensitive documents.' },
    { name: 'nativeMessaging', desc: 'Communicate with programs on your computer outside the browser entirely. Can interact with your file system and other installed applications.' },
  ]
  return (
    <>
      <Label>03 — what chrome APIs can do</Label>
      <Heading>The APIs that make extensions powerful — and dangerous</Heading>
      <Body>
        Chrome gives extensions access to powerful APIs that normal websites cannot touch. Here
        is what they can actually do with them.
      </Body>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 xl:gap-5">
        {apis.map(({ name, desc }) => (
          <div key={name} className="flex gap-4 lg:gap-5 border border-slate-100 rounded-lg px-4 py-5 lg:px-5 lg:py-6 xl:px-6 xl:py-7 bg-white">
            <code className="text-xs sm:text-sm lg:text-base font-mono text-slate-600 shrink-0 mt-0.5">{name}</code>
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}

const PERMISSIONS = [
  'cookies',
  'all_urls',
  'webRequest',
  'management',
  'scripting',
  'tabs',
  'history',
  'clipboardRead',
  'downloads',
  'storage',
  'notifications',
  'alarms',
]

// Slide 4 — Reading permissions: color-coded grid of all tracked permissions (HIGH / MEDIUM / LOW)
function Slide4() {
  return (
    <>
      <Label>04 — reading permissions</Label>
      <Heading>What to check before clicking Add to Chrome</Heading>
      <Body>
        Chrome shows you a permission list before you install. Most people skip it. Here is how
        to actually read it.
      </Body>
      <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
        {PERMISSIONS.map((name) => (
          <div key={name} className="border border-slate-100 rounded-lg px-4 lg:px-5 py-3.5 lg:py-4 bg-white">
            <span className="font-mono text-xs sm:text-sm lg:text-base text-slate-600">{name}</span>
          </div>
        ))}
      </div>
      <div className="border border-slate-200 rounded-xl px-5 lg:px-7 py-5 lg:py-6 bg-slate-50">
        <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Ask yourself:</span>{' '}
          does the extension's stated purpose actually require these permissions — or does it seem like more access than it needs?
        </p>
      </div>
    </>
  )
}

const FLAGS = [
  { color: 'bg-red-500',   title: 'Code is intentionally obfuscated',               sub: 'Legitimate extensions have readable code. When an extension hides what it does using scrambled or encoded JavaScript, it is concealing its true behavior from users and security researchers alike.' },
  { color: 'bg-red-500',   title: 'Contacts servers you do not recognize',           sub: 'Check where the extension sends your data. Anonymously registered domains, newly created servers, or domains with no public presence are serious concerns.' },
  { color: 'bg-red-500',   title: 'Permissions do not match its stated purpose',     sub: 'A note-taking app that requests access to all your cookies has no legitimate reason to need them. The wider the gap between purpose and permissions, the more suspicious the extension.' },
  { color: 'bg-red-500',   title: 'Extension ownership recently changed',            sub: 'Attackers buy legitimate extensions with established user bases and push malicious updates. An extension that was safe last year may not be safe today.' },
  { color: 'bg-amber-400', title: 'Anonymous developer with no public presence',     sub: 'Established publishers use verified company accounts. A single extension from an anonymous Gmail account with no other public work is much harder to hold accountable.' },
  { color: 'bg-amber-400', title: 'Very few reviews for a large install count',      sub: 'Fake installs are a common tactic to build false credibility. 100,000 installs with 4 reviews is a warning sign.' },
]

// Slide 5 — Red flags: six warning signs that an extension might not be trustworthy
function Slide5() {
  return (
    <>
      <Label>05 — red flags</Label>
      <Heading>Signs an extension might not be trustworthy</Heading>
      <div className="flex flex-col gap-6 sm:gap-7 lg:gap-9 xl:gap-10">
        {FLAGS.map(({ color, title, sub }) => (
          <div key={title} className="flex gap-4 lg:gap-5 items-start">
            <div className={`mt-1.5 w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shrink-0 ${color}`} />
            <div>
              <p className="font-semibold text-slate-900 text-sm sm:text-base lg:text-lg xl:text-xl leading-snug mb-2 lg:mb-3">{title}</p>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-500 leading-relaxed">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const CASES = [
  {
    date: 'Dec 2024',
    name: 'Cyberhaven',
    users: '2.6M users',
    desc: "A security company's own extension was compromised on Christmas Eve via a phishing attack on a developer. The malicious version stole authenticated session cookies. It passed Chrome's automated security review without being flagged.",
  },
  {
    date: '2020–2024',
    name: 'Honey by PayPal',
    users: '17M users',
    desc: 'The popular coupon extension was found to secretly replace affiliate tracking cookies at checkout, diverting commissions from content creators to itself. Users had no idea the extension was modifying their checkout behavior.',
  },
  {
    date: 'Feb 2025',
    name: '16 Trojaned Extensions',
    users: '3.2M users',
    desc: 'Ad blockers, emoji keyboards, and productivity tools were purchased from original developers by attackers who then pushed malicious updates. Extensions users trusted for years silently became surveillance tools overnight.',
  },
]

// Slide 6 — Real cases: Cyberhaven breach, Honey/PayPal, and 16 trojaned extensions
function Slide6() {
  return (
    <>
      <Label>06 — real cases</Label>
      <Heading>Extensions that betrayed their users</Heading>
      <Body>
        These are not hypothetical. These are documented attacks on extensions that millions of
        people trusted.
      </Body>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
        {CASES.map(({ date, name, users, desc }) => (
          <div key={name} className="border border-slate-200 rounded-xl px-6 py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12 bg-white flex flex-col gap-4 lg:gap-5">
            <div className="flex items-center justify-between">
              <p className="text-xs lg:text-sm text-slate-400 font-medium">{date}</p>
              <p className="text-xs lg:text-sm text-slate-400">{users}</p>
            </div>
            <p className="font-semibold text-slate-900 text-sm sm:text-base lg:text-xl xl:text-2xl">{name}</p>
            <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </>
  )
}

const TIMELINE = [
  { n: '1', text: 'You install an extension. It is safe, it works well, you trust it.' },
  { n: '2', text: 'The developer receives a phishing email or sells the extension. Ownership changes.' },
  { n: '3', text: 'An update is pushed. Chrome installs it automatically without asking you.' },
  { n: '4', text: 'The extension is now malicious. Your cookies, sessions, and browsing data are at risk — and you have no idea.' },
]

// Slide 7 — Hidden risk: supply chain attacks — how a trusted extension becomes dangerous after an update
function Slide7() {
  return (
    <>
      <Label>07 — the hidden risk</Label>
      <Heading>A safe extension can become dangerous overnight</Heading>
      <Body>
        The most dangerous attack vector is not a suspicious new extension — it is a trusted one
        that turns malicious after an update. This is called a supply chain attack and it is how
        the Cyberhaven breach happened.
      </Body>
      <div className="flex flex-col gap-5 sm:gap-7 lg:gap-9 xl:gap-11">
        {TIMELINE.map(({ n, text }, i) => (
          <div key={n} className="flex gap-4 lg:gap-5 items-start">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-7 h-7 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0">
                <span className="text-xs lg:text-sm font-bold text-slate-900">{n}</span>
              </div>
              {i < TIMELINE.length - 1 && <div className="w-px h-10 lg:h-12 xl:h-14 bg-slate-200 mt-1" />}
            </div>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-700 leading-snug pt-1">{text}</p>
          </div>
        ))}
      </div>
      <div className="border border-slate-200 rounded-xl px-6 lg:px-8 py-5 lg:py-7 bg-slate-50">
        <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Chrome auto-updates extensions silently.</span>{' '}
          An extension you checked six months ago may behave completely differently today.
        </p>
      </div>
    </>
  )
}

const ACTIONS = [
  {
    n: '01',
    title: 'Audit what you have',
    desc: 'Open chrome://extensions in your browser right now. Go through every extension listed. If you do not actively use it or do not remember installing it — remove it. Less is more when it comes to extensions.',
  },
  {
    n: '02',
    title: 'Check before you install',
    desc: 'Before adding any new extension, paste its Chrome Web Store URL into Extension Safe. See exactly what it can access, where it sends data, and whether its code is readable — in plain English, in seconds.',
  },
  {
    n: '03',
    title: 'Re-check extensions you rely on',
    desc: 'Trusted extensions can turn malicious after an ownership change or a compromised update. Any extension with access to sensitive sites like your bank, email, or work tools is worth rechecking periodically.',
  },
]

// Slide 8 — Take action: audit existing extensions, check before installing, re-check periodically
function Slide8() {
  return (
    <>
      <Label>08 — take action</Label>
      <Heading>What you can do right now</Heading>
      <Body>
        You do not need to be a security expert to protect yourself. These three steps take less
        than five minutes.
      </Body>
      <div className="flex flex-col gap-5 lg:gap-6 xl:gap-7">
        {ACTIONS.map(({ n, title, desc }) => (
          <div key={n} className="flex gap-5 lg:gap-6 border border-slate-200 rounded-xl px-6 lg:px-8 xl:px-10 py-6 lg:py-8 xl:py-9 bg-white items-start">
            <span className="text-xs lg:text-sm xl:text-base font-bold text-slate-300 shrink-0 mt-0.5">{n}</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm sm:text-base lg:text-xl xl:text-2xl mb-2 lg:mb-3">{title}</p>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-slate-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm lg:text-base xl:text-lg font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-xl self-start hover:bg-slate-700 transition-colors"
      >
        Analyze an extension now →
      </Link>
    </>
  )
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8]

// ─── Page ─────────────────────────────────────────────────────────────────────

// Fullscreen slide-based educational experience (8 slides).
// Manages current slide index and animation direction; supports keyboard arrows,
// swipe gestures (scroll-boundary aware), and dot/arrow button navigation.
export default function LearnPage() {
  const [index, setIndex] = useState(0)
  const [dir, setDir]     = useState(1)
  const touchY = useRef<number | null>(null)

  // Navigates to a specific slide index, setting direction for the slide animation
  const go = useCallback((next: number) => {
    if (next < 0 || next >= TOTAL) return
    setDir(next > index ? 1 : -1)
    setIndex(next)
  }, [index])

  const advance = useCallback(() => go(index + 1), [go, index])
  const retreat = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault(); advance()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); retreat()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance, retreat])

  // Records touch start Y so onTouchEnd can calculate swipe direction
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY }
  // Navigates slides on swipe, but only when the slide's scroll container is at its boundary —
  // prevents swipe-navigation from firing while the user is still scrolling through slide content
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchY.current === null) return
    const delta = touchY.current - e.changedTouches[0].clientY
    if (Math.abs(delta) > 60) {
      const scrollEl = document.querySelector('[data-slide-scroll]') as HTMLElement | null
      if (scrollEl) {
        const atTop    = scrollEl.scrollTop <= 2
        const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2
        if (delta > 0 && atBottom) advance()
        else if (delta < 0 && atTop) retreat()
      } else {
        delta > 0 ? advance() : retreat()
      }
    }
    touchY.current = null
  }

  const SlideComponent = SLIDES[index]
  const progress = ((index + 1) / TOTAL) * 100

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 z-30">
        <motion.div
          className="h-full bg-slate-900"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Back button */}
      <div className="absolute top-3 left-4 z-30">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs lg:text-sm text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M6.5 1.5L3 5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
      </div>

      {/* Slide area */}
      <div className="absolute inset-x-0 top-11 bottom-16 lg:bottom-20 flex items-center overflow-hidden">
        <AnimatePresence custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0 overflow-y-auto"
            data-slide-scroll=""
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100%', width: '100%' }}>
              <div className="w-full max-w-[680px] xl:max-w-3xl 2xl:max-w-5xl px-6 sm:px-8 xl:px-12 2xl:px-16 py-20 flex flex-col gap-8 sm:gap-10 lg:gap-12">
                <SlideComponent />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 lg:h-20 flex items-center justify-center z-30">

        <button
          onClick={retreat}
          disabled={index === 0}
          className="flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous slide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 mx-5 lg:mx-6">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-200 ${
                i === index
                  ? 'w-5 lg:w-6 h-2 lg:h-2.5 bg-slate-900'
                  : 'w-2 lg:w-2.5 h-2 lg:h-2.5 bg-slate-300 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={advance}
          disabled={index === TOTAL - 1}
          className="flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-400 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
          aria-label="Next slide"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Keyboard hint — desktop only */}
        <div className="absolute right-6 hidden sm:flex items-center gap-2 select-none">
          <span className="text-xs lg:text-sm text-slate-300">navigate</span>
          {['←', '→'].map(k => (
            <span key={k} className="text-xs border border-slate-200 rounded px-2 py-0.5 text-slate-400 font-mono bg-white">
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}