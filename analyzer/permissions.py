from analyzer import fetcher
OBUFUSCATIONS = {
    # Critical
    'eval_usage': {
        'patterns': ['eval('],
        'severity': 'critical',
        'explanation': 'Executes hidden code at runtime — most dangerous obfuscation technique'
    },
    'hex_obfuscation': {
        'patterns': ['_0x', '\\x6', '\\x7', '\\x61', '\\x66'],
        'severity': 'critical',
        'explanation': 'Code strings are hidden using hex encoding'
    },
    'jsfuck': {
        'patterns': ['[](![]+[])', '(!![]+[])'],
        'severity': 'critical',
        'explanation': 'JSFuck encoding used — extremely obfuscated code'
    },
    'runtime_decode': {
        'patterns': ['atob(', 'btoa('],
        'severity': 'high',
        'explanation': 'Decodes hidden strings at runtime using base64'
    },

    # High
    'dynamic_function': {
        'patterns': ['new Function(', 'setTimeout("', 'setInterval("'],
        'severity': 'high',
        'explanation': 'Creates or executes functions from strings — hides true intent'
    },
    'bracket_notation': {
        'patterns': ['window["fetch"]', 'chrome["cookies"]', 'chrome["tabs"]'],
        'severity': 'high',
        'explanation': 'Uses bracket notation to disguise Chrome API calls'
    },
    'char_code': {
        'patterns': ['String.fromCharCode(', 'fromCharCode', '.charCodeAt('],
        'severity': 'high',
        'explanation': 'Builds strings character by character to hide content'
    },

    # Medium
    'control_flow': {
        'patterns': ['while(true)', 'while (true)'],
        'severity': 'medium',
        'explanation': 'Infinite loop pattern used to obscure control flow'
    },
    'iife': {
        'patterns': ['(function(){(function(){'],
        'severity': 'medium',
        'explanation': 'Deeply nested self-executing functions hide logic'
    },
}

PERMISSION_PATTERN = {
    
    '<all_urls>': {
        'legitimate': [
            'chrome.tabs.query',
            'content_scripts',
        ],
        'suspicious': [
            'fetch(',
            'XMLHttpRequest',
            'chrome.cookies.getAll',
        ],
        'suspicious_combinations': [
            ('chrome.cookies.get', 'fetch('),
            ('chrome.tabs.query', 'XMLHttpRequest'),
        ],
        'explanation': 'Access to every website combined with network requests suggests data collection'
    },

    'webRequest': {
        'legitimate': [
            'chrome.webRequest.onCompleted',
            'chrome.webRequest.onBeforeRequest',
        ],
        'suspicious': [
            'redirectUrl',              # redirecting your requests
            'requestBody',              # reading what you send to sites
            'fetch(',                   # sending intercepted data out
        ],
        'suspicious_combinations': [
            ('requestBody', 'fetch('),  # reading form data and sending it out
            ('redirectUrl', 'fetch('),  # redirecting and phoning home
        ],
        'explanation': 'Intercepts your network requests and may redirect or read sensitive data'
    },

    'webNavigation': {
        'legitimate': [
            'chrome.webNavigation.onCompleted',
        ],
        'suspicious': [
            'fetch(',                   # sending navigation history out
            'XMLHttpRequest',
            'chrome.storage.sync.set', # storing everywhere you go
        ],
        'suspicious_combinations': [
            ('onCommitted', 'fetch('),  # tracking every page visit and reporting it
        ],
        'explanation': 'Tracks every page you navigate to and may report it externally'
    },

    'cookies': {
        'legitimate': [
            'chrome.cookies.get',
            'chrome.cookies.set',
        ],
        'suspicious': [
            'chrome.cookies.getAll',    # grabbing ALL cookies at once
            'fetch(',                   # sending cookies somewhere
            'XMLHttpRequest',
        ],
        'suspicious_combinations': [
            ('cookies.getAll', 'fetch('),       # exfiltration
            ('onUpdated', 'cookies.set'),        # Honey-style hijacking
            ('cookies.get', 'XMLHttpRequest'),   # collecting and sending
        ],
        'explanation': 'Can read cookies across all sites and may exfiltrate login sessions'
    },

    'tabs': {
        'legitimate': [
            'chrome.tabs.query',
            'chrome.tabs.create',
            'chrome.tabs.update',
        ],
        'suspicious': [
            'chrome.tabs.executeScript',  # injecting code into tabs
            'fetch(',                     # sending tab data out
            'chrome.tabs.captureVisibleTab', # screenshotting your tabs
        ],
        'suspicious_combinations': [
            ('tabs.query', 'fetch('),           # reading all tabs and reporting them
            ('executeScript', 'XMLHttpRequest'), # injecting and phoning home
        ],
        'explanation': 'Can see all open tabs and may inject code or report URLs externally'
    },

    'history': {
        'legitimate': [
            'chrome.history.search',
            'chrome.history.getVisits',
        ],
        'suspicious': [
            'fetch(',
            'XMLHttpRequest',
            'chrome.storage.sync.set',
        ],
        'suspicious_combinations': [
            ('history.search', 'fetch('),     # reading and sending your history
            ('history.getVisits', 'fetch('),  # same
        ],
        'explanation': 'Reads your full browsing history and may send it to external servers'
    },

    'browsingData': {
        'legitimate': [
            'chrome.browsingData.remove',
        ],
        'suspicious': [
            'chrome.browsingData.removeHistory',
            'chrome.browsingData.removeCookies',
            'chrome.browsingData.removePasswords',
        ],
        'suspicious_combinations': [
            ('removeCookies', 'fetch('),    # deleting evidence after stealing data
            ('removeHistory', 'fetch('),    # same pattern
        ],
        'explanation': 'Can delete your history, cookies, and saved passwords'
    },

    'clipboardRead': {
        'legitimate': [
            'navigator.clipboard.readText',
        ],
        'suspicious': [
            'fetch(',           # sending clipboard contents out
            'XMLHttpRequest',
            'setInterval(',     # repeatedly reading clipboard on a timer
        ],
        'suspicious_combinations': [
            ('clipboard.readText', 'fetch('),      # reading and exfiltrating
            ('clipboard.readText', 'setInterval'), # polling your clipboard constantly
        ],
        'explanation': 'Reads everything you copy including passwords and sensitive data'
    },

    'nativeMessaging': {
        'legitimate': [
            'chrome.runtime.connectNative',
        ],
        'suspicious': [
            'fetch(',
            'chrome.runtime.connectNative', # any use is worth flagging
        ],
        'suspicious_combinations': [
            ('connectNative', 'fetch('),  # talking to local app AND external server
        ],
        'explanation': 'Can communicate with programs installed on your computer — very high risk'
    },

    'storage': {
        'legitimate': [
            'chrome.storage.local.set',
            'chrome.storage.local.get',
            'chrome.storage.sync.set',
        ],
        'suspicious': [
            'password',         # storing passwords
            'token',            # storing auth tokens
            'credit',           # storing financial data
        ],
        'suspicious_combinations': [
            ('storage.sync.set', 'fetch('),  # syncing data and also sending it out
        ],
        'explanation': 'Stores data locally — suspicious if storing sensitive information'
    },

    'debugger': {
        'legitimate': [],       # no legitimate use in consumer extensions
        'suspicious': [
            'chrome.debugger.attach',
            'chrome.debugger.sendCommand',
        ],
        'suspicious_combinations': [
            ('debugger.attach', 'fetch('),  # attaching debugger and reporting data
        ],
        'explanation': 'Attaches a debugger to your browser — extremely powerful and rarely legitimate'
    },

    'management': {
        'legitimate': [
            'chrome.management.getAll',
        ],
        'suspicious': [
            'chrome.management.uninstall',  # uninstalling other extensions
            'chrome.management.setEnabled', # disabling other extensions
            'fetch(',
        ],
        'suspicious_combinations': [
            ('management.getAll', 'fetch('),       # listing and reporting your extensions
            ('management.uninstall', 'fetch('),    # removing extensions remotely
        ],
        'explanation': 'Can list, disable, or uninstall your other extensions'
    },
}

#This method looks through the manifest dictionary and sees if there is 
#suspicious use cases of the permissions in the Java script files checking
#if the commonly used malicious practices are being used
def analyze_permissions(manifest: dict, Java_files: dict):
   data_security_score = 0
   explanation = ""
   permission = []
   if not isinstance(manifest, dict):
      return 0, ""
   permission += manifest.get('host_permissions') or []
   permission += manifest.get('permissions') or []

   if isinstance(Java_files, dict):
      contents = list(Java_files.values())
   elif isinstance(Java_files, str):
      contents = [Java_files]
   else:
    try:
      contents = list(Java_files)
    except TypeError:
      contents = [str(Java_files)]
   for perm in permission:
      if perm not in PERMISSION_PATTERN:
         continue
      pattern = PERMISSION_PATTERN.get(perm)
      # checks to see if there is any suspicious usecases of the permissions
      for p in pattern.get('suspicious', []):
         if any(p in c for c in contents):
            explanation += pattern.get('explanation') + "\n"
            data_security_score += 1
            break
      # checks for the combination being in a file or multiple different files
      for combo in pattern.get('suspicious_combinations', []):
         if not isinstance(combo, (dict, tuple)) or len(combo) < 2:
            continue
         a, b = combo[0], combo[1]
         if any(a in c and b in c for c in contents):
            explanation += pattern.get('explanation') + "\n"
            data_security_score += 2
            break
         elif any(a in c for c in contents) and any(b in c for c in contents):
            explanation += pattern.get('explanation') + "(across Files)\n"
            data_security_score += 1
   return data_security_score, explanation
    
# This method checks to see if there is any obfuscation in the java files
# it makes sure that there is no hidden code within the files which can
# be very suspicious 
def ofuscated(Java_files: dict):
   problem = []
   if not Java_files:
      return {
         'obfuscation': len(problem) > 0,
         'flage': [],
         'explanation': "No Java Files"
      }
   allFiles = ''.join(Java_files.values())
   for name, data in OBUFUSCATIONS.items():
      for pattern in data['patterns']:
         if pattern in allFiles:
            problem.append({
               'obfuscation': name,
               'severity': data['severity'],
               'explanation': data['explanation']
            })
            break
   return {
      'obfuscation': len(problem) > 0,
      'flags': problem,
      'explanation': 'SUSPICIOUS - code is being hidden from users' if problem else "NO OBFUSCATION"
   }

if __name__ == '__main__':
    result = fetcher.fetch_extension("https://chromewebstore.google.com/detail/disable-page-visibility/cebifddlogbjhoibpjobhlamopmlpckl")
    manifest = result.get('manifest')
    js_files = result.get('Javascript_files')

    score, explanation = analyze_permissions(manifest, js_files)
    obfuscation = ofuscated(js_files)

    print("Score:", score)
    print("Explanation:", explanation)
    print("Obfuscation:", obfuscation)