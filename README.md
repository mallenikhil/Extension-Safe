# Extension Safe

A Chrome extension security analyzer. Paste any Chrome Web Store URL and get a plain-English report covering permissions, network calls, content script scope, obfuscation techniques, and an AI-generated assessment of whether the extension's access matches its stated purpose.

![Extension Safe](https://img.shields.io/badge/stack-Next.js%20%2B%20FastAPI-0f172a)

## What it does

- **Permission analysis** — maps every declared permission to what it actually allows in plain English
- **Network call detection** — scans JavaScript for `fetch()`, `XMLHttpRequest`, and `WebSocket` calls and extracts external domains
- **Content script mapping** — lists every site the extension injects code into via `content_scripts` match patterns
- **Obfuscation detection** — flags hex encoding, `eval()` usage, base64 runtime decoding, and deeply nested functions
- **AI assessment** — uses Groq (LLaMA 3.3 70B) to assess whether the permissions are proportionate to the extension's stated purpose

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Framer Motion, Tailwind CSS |
| Backend | FastAPI (Python) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Extension parsing | CRX download + ZIP extraction |

## Project structure

```
Extension_Safe/
├── main.py                  # FastAPI app + /analyze endpoint
├── analyzer/
│   ├── fetcher.py           # Downloads and extracts CRX from Chrome Web Store
│   ├── permissions.py       # Maps manifest permissions to descriptions
│   ├── js_scanner.py        # Scans JS for network calls and match patterns
│   └── ai_opinion.py        # Groq API call for AI assessment
└── extension-safe-frontend/
    └── app/
        ├── page.tsx         # Home — URL input and analyze trigger
        ├── report/page.tsx  # Report display
        ├── learn/page.tsx   # Interactive slide explainer
        └── about/page.tsx   # How the analysis works
```

## Deployment

The backend and frontend are deployed separately:

- **Frontend** → Vercel (set `NEXT_PUBLIC_API_URL` to your backend URL)
- **Backend** → Railway or Render (set `GROQ_API_KEY` as an environment variable)
