from cv_engine import analyze_currency_note
import os

def test_cv():
    print("Testing CV Engine on sample notes...")
    
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    genuine_path = os.path.join(samples_dir, "genuine_500.png")
    counterfeit_path = os.path.join(samples_dir, "counterfeit_500.png")
    
    print(f"Genuine path exists: {os.path.exists(genuine_path)}")
    print(f"Counterfeit path exists: {os.path.exists(counterfeit_path)}")
    
    print("\n--- ANALYZING GENUINE NOTE ---")
    res_gen = analyze_currency_note(genuine_path)
    if "error" in res_gen:
        print(f"Error checking genuine note: {res_gen['error']}")
    else:
        print(f"Verdict: {res_gen['verdict']}")
        print(f"Confidence: {res_gen['confidence']}%")
        print(f"Features: {len(res_gen['features'])} analyzed")
        for f in res_gen["features"]:
            print(f" - {f['name']}: {f['status']} ({f['details'][:45]}...)")
            
    print("\n--- ANALYZING COUNTERFEIT NOTE ---")
    res_fake = analyze_currency_note(counterfeit_path)
    if "error" in res_fake:
        print(f"Error checking counterfeit note: {res_fake['error']}")
    else:
        print(f"Verdict: {res_fake['verdict']}")
        print(f"Confidence: {res_fake['confidence']}%")
        print(f"Features: {len(res_fake['features'])} analyzed")
        for f in res_fake["features"]:
            print(f" - {f['name']}: {f['status']} ({f['details'][:45]}...)")

if __name__ == "__main__":
    test_cv()
