from nlp_engine import analyze_message_locally

def test_nlp():
    print("Testing NLP Local Engine...")
    
    test_cases = [
        {
            "name": "Digital Arrest",
            "text": "This is CBI officer. A parcel with MDMA drugs has been seized. You are under digital arrest. You must remain on video call."
        },
        {
            "name": "Job Scam",
            "text": "Earn Rs. 5000 daily. Just do part-time hotel rating on telegram task. Deposit Rs 1000 for VIP membership."
        },
        {
            "name": "Lottery Scam",
            "text": "Congratulations you won KBC lottery worth 25 lakhs. Contact bank manager for processing fee transfer."
        },
        {
            "name": "Safe message",
            "text": "Hey, are we still meeting for lunch at 12 PM today? Let me know."
        }
    ]
    
    for tc in test_cases:
        res = analyze_message_locally(tc["text"])
        print(f"\nTest Case: {tc['name']}")
        print(f"Risk Score: {res['risk_score']}%")
        print(f"Category: {res['category']}")
        print(f"Explanation: {res['explanation']}")
        print(f"Flags: {res['red_flags']}")
        print(f"Highlights: {res['highlights']}")
        assert res["risk_score"] is not None

if __name__ == "__main__":
    test_nlp()
