import os
from groq import Groq


def get_ai_opinion(
    extension_name: str,
    description: str,
    publisher: str | None,
    network_calls: list,
    capabilities: list,
    obfuscation_flags: list,
) -> str:

    purpose   = description.strip() if description else "No description provided"
    publisher_str = publisher or "Unknown publisher"

    caps_text     = "\n".join(f"- {c}" for c in capabilities)      if capabilities      else "- None detected"
    networks_text = "\n".join(f"- {d}" for d in network_calls)     if network_calls     else "- None detected"
    obf_text      = "\n".join(f"- {f}" for f in obfuscation_flags) if obfuscation_flags else "- None"

    prompt = f"""You are a browser security analyst helping non-technical users understand Chrome extensions. Write in plain English at an 8th grade reading level. Be direct and specific.

Extension: {extension_name}
Publisher: {publisher_str}
Stated purpose: {purpose}

What it can access:
{caps_text}

External servers it contacts:
{networks_text}

Code obfuscation detected:
{obf_text}

Write a short security assessment (4-6 sentences). Cover:
1. What this extension does and whether its permissions make sense for that purpose
2. Any capabilities that seem broader than necessary
3. Whether the code obfuscation is a concern
4. A plain-English verdict on whether the user should be cautious

Be direct. Do not hedge with "may" or "could potentially". If something is a concern, say so clearly."""

    try:
        client = Groq(api_key=os.environ["GROQ_API_KEY"])
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return response.choices[0].message.content.strip()
    except KeyError:
        return 'AI analysis unavailable — GROQ_API_KEY environment variable is not set'
    except Exception:
        return 'AI analysis unavailable — Groq API request failed'
