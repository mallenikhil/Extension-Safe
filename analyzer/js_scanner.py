from analyzer import fetcher
import re


KNOWN_SAFE = {
    'google.com', 'googleapis.com', 'chrome.google.com',
    'chromewebstore.google.com', 'github.com', 'microsoft.com',
    'mozilla.org', 'w3.org', 'whatsapp.com', 'example.com',
    'cloudflare.com', 'jsdelivr.net', 'unpkg.com'
}

SUSPICIOUS_TLDS = {'.ru', '.cn', '.xyz', '.tk', '.pw', '.top', '.br'}

FETCH_PATTERNS = [
    r'fetch\s*\(\s*["\']https?://([^/\'"]+)',
    r'\.open\s*\(\s*["\'][A-Z]+["\'],\s*["\']https?://([^/\'"]+)',
    r'axios\.[a-z]+\s*\(\s*["\']https?://([^/\'"]+)',
    r'\.get\s*\(\s*["\']https?://([^/\'"]+)',
    r'\.post\s*\(\s*["\']https?://([^/\'"]+)',
    r'WebSocket\s*\(\s*["\']wss?://([^/\'"]+)',
]


def extract_network_calls(js_files: dict) -> list:
    if not js_files:
        return []
    all_js = ' '.join(js_files.values())
    domains = set()
    for pattern in FETCH_PATTERNS:
        for match in re.findall(pattern, all_js):
            domain = match.split('/')[0].split('?')[0].split(':')[0]
            if domain and len(domain) > 3 and '${' not in domain and '`' not in domain:
                domains.add(domain)
    return sorted(domains)


def extract_match_patterns(manifest: dict) -> list:
    if not isinstance(manifest, dict):
        return []
    domains = set()
    for cs in manifest.get('content_scripts', []):
        for match in cs.get('matches', []):
            m = re.match(r'(?:\*|https?|wss?)://(?:\*\.)?([^/\*]+)', match)
            if m:
                domain = m.group(1)
                if domain and domain != '*':
                    domains.add(domain)
    return sorted(domains)


def flag_suspicious_domains(domains: list):
    safe = []
    suspicious = []
    unknown = []
    for domain in domains:
        if any(domain.endswith(d) for d in KNOWN_SAFE):
            safe.append(domain)
        elif any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
            suspicious.append({'domain': domain, 'reason': f'Unusual TLD — .{domain.split(".")[-1]}'})
        elif 'dev.' in domain or 'staging.' in domain:
            suspicious.append({'domain': domain, 'reason': 'Development server accessible publicly'})
        elif ':' in domain:
            suspicious.append({'domain': domain, 'reason': 'Uses non-standard port'})
        else:
            unknown.append(domain)
    return {'safe': safe, 'suspicious': suspicious, 'unknown': unknown}


CAPABILITY_MAP = {
    'chrome.cookies': 'Can read and write cookies from websites you visit',
    'document.cookie': 'Reads cookies directly from web pages',
    'chrome.tabs': 'Can see and control your open tabs',
    'chrome.history': 'Can access your browsing history',
    'chrome.downloads': 'Can download files to your computer',
    'chrome.storage': 'Stores data in your browser',
    'chrome.webRequest': 'Intercepts your network requests',
    'chrome.scripting': 'Injects code into web pages you visit',
    'fetch(': 'Makes requests to external servers',
    'XMLHttpRequest': 'Makes requests to external servers',
    'document.querySelector': 'Reads content from web pages',
    'addEventListener("keydown")': 'Monitors your keystrokes',
    'navigator.geolocation': 'Accesses your physical location',
    'navigator.clipboard': 'Reads your clipboard',
    'localStorage': 'Reads and writes browser local storage',
    'sessionStorage': 'Reads and writes browser session storage',
    'indexedDB': 'Accesses browser database storage',
    'WebSocket': 'Opens persistent connection to external server',
}


def extract_capabilities(js_files: dict):
    if not js_files:
        return []
    string = ' '.join(js_files.values())
    used = []
    for cap in CAPABILITY_MAP:
        if re.search(re.escape(cap), string):
            used.append(CAPABILITY_MAP[cap])
    return list(set(used))


if __name__ == '__main__':
    result = fetcher.fetch_extension("https://chromewebstore.google.com/detail/privacy-extension-for-wha/cgipcgghboamefelooajpiabilddemlh")
    js_files = result.get('Javascript_files')
    manifest = result.get('manifest')
    print("Network calls:", extract_network_calls(js_files))
    print("Match patterns:", extract_match_patterns(manifest))
    print("Capabilities:", extract_capabilities(js_files))