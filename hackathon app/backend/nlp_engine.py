import os
import re

SCAM_PATTERNS = {
    "Digital Arrest": {
        "keywords": [
            r"cbi", r"cid", r"customs", r"police", r"narcotics", r"court", r"warrant", r"arrest", 
            r"digital arrest", r"video call verification", r"confidential room", r"do not hang up", 
            r"law enforcement", r"supreme court", r"illegal parcel", r"ed officer", r"enforcement directorate",
            r"national investigation agency", r"nia", r"skype call", r"interrogation"
        ],
        "red_flags": [
            "Impersonation of law enforcement (CBI, Customs, ED, Police)",
            "Threat of immediate 'digital arrest' or jail",
            "Demand to remain on video call for 'investigation' or 'verification'",
            "Allegations of illegal parcels containing drugs, contraband, or passports"
        ],
        "explanation_template": "This matches the 'Digital Arrest' script. Scammers impersonate government authorities (CBI, Customs, or Police), falsely claiming an illegal shipment (drugs/contraband) has been sent in your name, demanding you stay on a video call, and threatening arrest unless you transfer funds for 'verification'."
    },
    "Job Scam": {
        "keywords": [
            r"telegram task", r"part-time", r"earn money", r"salary", r"like youtube video", r"daily payment", 
            r"click links", r"commission", r"prepaid task", r"merchant task", r"work from home", r"wfh", 
            r"extra income", r"hotel rating", r"google maps review", r"deposit money"
        ],
        "red_flags": [
            "Offers of high pay for trivial tasks (e.g., liking videos, rating hotels)",
            "Requirement to join a Telegram group to receive payments",
            "Demand for 'prepaid tasks' or security deposits to unlock higher commissions"
        ],
        "explanation_template": "This matches a typical 'Prepaid Task / Job Scam'. Scammers lure victims with simple tasks like liking videos, then force them into private Telegram channels where they are coerced into making cash deposits ('prepaid tasks') to withdraw their earned money, which is ultimately stolen."
    },
    "Lottery / Prize Scam": {
        "keywords": [
            r"kbc", r"lottery", r"draw", r"won", r"prize", r"crore", r"lakhs", r"whatsapp prize", 
            r"processing fee", r"security fee", r"lucky winner", r"kaun banega crorepati", r"car winner",
            r"gift voucher", r"jackpot"
        ],
        "red_flags": [
            "Unsolicited notification of winning a lottery or jackpot",
            "Requests for personal bank details or processing fees to release the prize",
            "Impersonation of popular brands or TV shows like Kaun Banega Crorepati (KBC)"
        ],
        "explanation_template": "This is a 'Lottery or KBC Scam'. Victims receive messages via WhatsApp claiming they have won a massive lottery. The fraudsters then ask for 'processing fees', 'tax registration', or 'activation charges' before the prize can be released, fleeing once the money is paid."
    },
    "Courier / Customs Scam": {
        "keywords": [
            r"fedex", r"dhl", r"illegal parcel", r"passport", r"drugs found", r"contraband", 
            r"customs clearance", r"border protection", r"package holding", r"customs duty", 
            r"mdma in package", r"taiwan parcel", r"cambodia courier"
        ],
        "red_flags": [
            "Claims that an international package containing contraband is addressed to you",
            "Demand for immediate payment of 'customs clearance fee' or 'release fine'",
            "Urgent threats of legal prosecution by airport customs authorities"
        ],
        "explanation_template": "This matches a 'Courier / Customs Scam'. Scammers claim a package sent by or to you contains drugs, weapons, or fake passports, and was seized by customs. They demand payments for 'clearance' or 'bail' while mimicking shipping companies or customs officials."
    },
    "Sextortion": {
        "keywords": [
            r"video call screen", r"recording", r"naked", r"leaked", r"youtube upload", r"defame", 
            r"social media share", r"money demand", r"intimidation", r"obscene video", r"morphing"
        ],
        "red_flags": [
            "Blackmail using screenshots or recordings of a brief video call",
            "Threats to upload morphed or private recordings to YouTube or send them to family",
            "Demands for money to delete incriminating footage"
        ],
        "explanation_template": "This is a 'Sextortion Scam'. Scammers make unsolicited video calls on WhatsApp, record a brief snippet of the victim's face alongside obscene material, and then blackmail the victim, demanding money under threat of sharing the morphed video with friends and family."
    }
}

URGENCY_KEYWORDS = [
    r"urgent", r"now", r"immediately", r"within 10 minutes", r"do not disconnect", 
    r"confidential", r"jail", r"arrest", r"freeze account", r"final warning"
]

def analyze_message_locally(text: str) -> dict:
    text_lower = text.lower()
    matched_categories = {}
    
    # 1. Match categories based on keyword presence
    for category, config in SCAM_PATTERNS.items():
        matches = []
        for kw in config["keywords"]:
            if re.search(r'\b' + kw + r'\b', text_lower) or kw in text_lower:
                matches.append(kw)
        if matches:
            matched_categories[category] = matches
            
    # 2. Check general urgency flags
    urgency_matches = []
    for kw in URGENCY_KEYWORDS:
        if re.search(r'\b' + kw + r'\b', text_lower) or kw in text_lower:
            urgency_matches.append(kw)

    # 3. Determine Risk Score and Verdict
    if not matched_categories:
        # Check if there are still suspicious elements like urgency words combined with bank accounts/money
        money_words = ["money", "rupees", "transfer", "pay", "bank", "google pay", "phonepe", "upi", "card"]
        has_money = any(mw in text_lower for mw in money_words)
        
        if len(urgency_matches) >= 2 and has_money:
            return {
                "risk_score": 45,
                "category": "Suspicious / Phishing",
                "explanation": "Though it doesn't match a specific known script, this message contains high-urgency language combined with payment or account references, which is a key characteristic of phishing scams.",
                "red_flags": [
                    "High-urgency language demanding immediate action",
                    "References to money transfers, payments, or banking accounts"
                ],
                "highlights": urgency_matches + [mw for mw in money_words if mw in text_lower]
            }
        
        return {
            "risk_score": 5,
            "category": "Safe / Unknown",
            "explanation": "No known scam patterns, high-urgency threats, or typical impersonation scripts were detected. However, always exercise caution when sharing personal details.",
            "red_flags": [],
            "highlights": []
        }

    # Identify primary category (the one with the most matches)
    primary_category = max(matched_categories, key=lambda k: len(matched_categories[k]))
    cat_config = SCAM_PATTERNS[primary_category]
    
    # Calculate score based on match count and urgency
    base_score = 40 + min(len(matched_categories[primary_category]) * 15, 45)
    urgency_bonus = min(len(urgency_matches) * 8, 15)
    risk_score = min(base_score + urgency_bonus, 99)
    
    # Combine keywords found for highlighting
    all_highlights = matched_categories[primary_category] + urgency_matches
    
    return {
        "risk_score": int(risk_score),
        "category": primary_category,
        "explanation": cat_config["explanation_template"],
        "red_flags": cat_config["red_flags"],
        "highlights": list(set(all_highlights))
    }

def analyze_message(text: str) -> dict:
    # Check if Gemini API key is available
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return analyze_message_locally(text)
        
    try:
        from google import genai
        from google.genai import types
        import json
        
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an AI specialized in Digital Public Safety. Analyze the following suspicious message or call script for scams, particularly focusing on Indian scams like Digital Arrest, Job Scams, KBC Lottery, Courier Fraud, and Sextortion.
Provide the analysis in strict JSON format matching this schema:
{{
  "risk_score": number (0 to 100),
  "category": string (e.g., "Digital Arrest", "Job Scam", "Lottery Scam", "Courier Scam", "Sextortion", "Safe"),
  "explanation": string (detailed description of the scam pattern and why it is flagged, or reassurance if safe),
  "red_flags": array of strings (specific warnings seen in the text),
  "highlights": array of strings (exact words or short phrases from the text that are highly suspicious)
}}

Suspicious Text:
\"\"\"
{text}
\"\"\"
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text.strip())
        return result
    except Exception as e:
        print(f"Gemini API error (falling back to local engine): {e}")
        return analyze_message_locally(text)
