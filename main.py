from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from analyzer import fetcher, permissions, js_scanner
from analyzer.ai_opinion import get_ai_opinion

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/analyze")
@limiter.limit("5/minute")
def analyze_extension(request: Request, url: str):
    try:
        result = fetcher.fetch_extension(url)
        manifest = result.get('manifest')
        js_files = result.get('Javascript_files')
        name = result.get('name')
        description = result.get('description')

        webstore  = fetcher.fetch_webstore_metadata(url)
        publisher = webstore.get('publisher') or manifest.get('author')

        score, explanation = permissions.analyze_permissions(manifest, js_files)
        obfuscation = permissions.ofuscated(js_files)
        capabilities = js_scanner.extract_capabilities(js_files)
        network_calls = js_scanner.extract_network_calls(js_files)
        match_patterns = js_scanner.extract_match_patterns(manifest)
        obfuscation_explanations = [
            f['explanation'] for f in obfuscation.get('flags', [])
        ]

        ai_opinion = get_ai_opinion(
            extension_name=name,
            description=description or '',
            publisher=publisher,
            network_calls=network_calls,
            capabilities=capabilities,
            obfuscation_flags=obfuscation_explanations,
        )

        return {
            "status": "success",
            "extension_name": name,
            "version": manifest.get('version'),
            "description": description,
            "what_it_can_do": capabilities,
            "network_calls": network_calls,
            "match_patterns": match_patterns,
            "permission_score": score,
            "permission_flags": explanation,
            "obfuscation": obfuscation,
            "ai_opinion": ai_opinion
        }

    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": "Unexpected error occurred"}