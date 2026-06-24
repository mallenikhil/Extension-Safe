import httpx
import zipfile
import struct
import io
import json
import re


def _resolve_msg(zip_file, messages_cache: dict, value: str, fallback: str) -> str:
    if not value or not value.startswith('__MSG_'):
        return value or fallback
    key = value.replace('__MSG_', '').replace('__', '')
    if not messages_cache:
        try:
            for locale in ('_locales/en/messages.json', '_locales/en_US/messages.json'):
                try:
                    messages_cache.update(json.loads(zip_file.read(locale)))
                    break
                except KeyError:
                    pass
        except Exception:
            pass
    for k, v in messages_cache.items():
        if k.lower() == key.lower():
            return v.get('message', fallback)
    return fallback


def get_real_name(zip_file, manifest: dict) -> str:
    cache: dict = {}
    return _resolve_msg(zip_file, cache, manifest.get('name', ''), 'Unknown Extension')


def fetch_extension(extension_link: str) -> dict:
    extension_id = extension_link.split("/")[-1].split("?")[0]

    params = {
        'response': 'redirect',
        'acceptformat': 'crx3',
        'prodversion': '120.0.6099.109',
        'x': f'id={extension_id}&installsource=ondemand&uc'
    }

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    try:
        response = httpx.get(
            'https://clients2.google.com/service/update2/crx',
            params=params,
            headers=headers,
            follow_redirects=True,
            timeout=15.0
        )
    except httpx.TimeoutException:
        raise ValueError("Request timed out — check your internet connection")
    except httpx.RequestError as e:
        raise ValueError(f"Network error: {e}")

    crx_bytes = response.content

    if response.status_code != 200 or len(crx_bytes) < 50:
        raise ValueError("This extension could not be downloaded — it may be restricted or enterprise-only")

    if crx_bytes[:4] != b'Cr24':
        raise ValueError("Downloaded file is not a valid Chrome extension")

    try:
        header = struct.unpack('<I', crx_bytes[8:12])[0]
        zip_start = 12 + header
        zip_data = crx_bytes[zip_start:]
        zip_file = zipfile.ZipFile(io.BytesIO(zip_data))
    except zipfile.BadZipFile:
        raise ValueError("Extension file is corrupted or in an unsupported format")

    try:
        manifest_bytes = zip_file.read('manifest.json')
        manifest_dict = json.loads(manifest_bytes)
    except:
        raise ValueError("manifest.json could not be read or parsed")

    messages_cache: dict = {}
    name = _resolve_msg(zip_file, messages_cache, manifest_dict.get('name', ''), 'Unknown Extension')
    description = _resolve_msg(zip_file, messages_cache, manifest_dict.get('description', ''), '')

    js_files = {}
    for fileName in zip_file.namelist():
        if fileName.endswith(".js"):
            try:
                js_files[fileName] = zip_file.read(fileName).decode('utf-8', errors='ignore')
            except Exception:
                pass

    return {
        'name': name,
        'description': description,
        'Javascript_files': js_files,
        'manifest': manifest_dict
    }


def fetch_webstore_metadata(extension_link: str) -> dict:
    """Scrape install count and publisher name from the Chrome Web Store page."""
    try:
        r = httpx.get(
            extension_link,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
            timeout=10.0,
            follow_redirects=True,
        )
        html = r.text

        # Install count — appears as e.g. "10,000,000 users" or "1M+ users" in the page
        install_count = None
        count_match = re.search(r'([\d,\.]+[MBK]?\+?\s*users)', html, re.IGNORECASE)
        if count_match:
            install_count = count_match.group(1).strip()

        # Publisher — appears in JSON-LD or as a plain author meta field
        publisher = None
        pub_match = re.search(r'"author"\s*:\s*"([^"]+)"', html)
        if pub_match:
            publisher = pub_match.group(1).strip()

        return {'install_count': install_count, 'publisher': publisher}
    except Exception:
        return {'install_count': None, 'publisher': None}