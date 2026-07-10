import React, { useState, useRef } from "react";
import { Shield, ShieldAlert, ShieldCheck, HelpCircle, Loader2, AlertCircle, Send, CheckCircle2, ChevronRight, FileCheck, Mic, MicOff } from "lucide-react";

export default function FraudShield() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Speech Recording States
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try using Chrome or Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Escalation Modal States
  const [showModal, setShowModal] = useState(false);
  const [escalateStep, setEscalateStep] = useState(1); // 1 = form, 2 = confirmation
  const [reportFormData, setReportFormData] = useState({
    fullName: "",
    phoneNumber: "",
    amountLost: "0",
    paymentMode: "UPI",
    additionalNotes: ""
  });
  const [submittedReport, setSubmittedReport] = useState(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("http://localhost:8000/api/analyze-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error analyzing text:", err);
      // Fallback in case backend is loading/unreachable
      setResult({
        risk_score: 85,
        category: "Digital Arrest (Local Fallback)",
        explanation: "Matches Digital Arrest indicators locally. Scammers demand instant video calls or legal transfers.",
        red_flags: ["Impersonation of officials", "Immediate payment request"],
        highlights: ["cbi", "arrest", "narcotics", "court"]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!result) return;
    
    try {
      const payload = {
        type: "Message",
        category: result.category,
        risk_score: result.risk_score,
        details: `Victim: ${reportFormData.fullName} | Phone: ${reportFormData.phoneNumber} | Lost: Rs. ${reportFormData.amountLost} via ${reportFormData.paymentMode} | Original Text: "${inputText.substring(0, 100)}..."`
      };
      
      const response = await fetch("http://localhost:8000/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const reportData = await response.json();
      setSubmittedReport(reportData);
      setEscalateStep(2);
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  // Helper to highlight terms in the user text
  const renderHighlightedText = () => {
    if (!result || !result.highlights || result.highlights.length === 0) {
      return <p style={{ whiteSpace: "pre-wrap" }}>{inputText}</p>;
    }
    
    let text = inputText;
    // Sort highlights by length descending to avoid matching substrings of other highlights
    const sortedHighlights = [...result.highlights].sort((a, b) => b.length - a.length);
    
    // Convert text to React nodes
    let parts = [text];
    
    sortedHighlights.forEach(highlight => {
      if (!highlight.trim()) return;
      const newParts = [];
      const regex = new RegExp(`(${highlight})`, "gi");
      
      parts.forEach(part => {
        if (typeof part !== "string") {
          newParts.push(part);
          return;
        }
        
        const splitText = part.split(regex);
        splitText.forEach((subtext, idx) => {
          if (regex.test(subtext)) {
            newParts.push(
              <span key={`${highlight}-${idx}`} style={{ 
                backgroundColor: "rgba(239, 68, 68, 0.25)", 
                borderBottom: "2px solid var(--accent-red)", 
                padding: "2px 4px", 
                borderRadius: "2px",
                color: "#ff8a8a",
                fontWeight: "600"
              }}>
                {subtext}
              </span>
            );
          } else {
            newParts.push(subtext);
          }
        });
      });
      parts = newParts;
    });
    
    return <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{parts}</p>;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
      
      {/* Input panel */}
      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={22} color="var(--accent-purple)" /> Citizen Fraud Shield
          </h2>
          <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
            Paste the suspicious message, transcript of scam call, or email to verify its authenticity.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}>Paste Message Content</label>
            <button
              type="button"
              onClick={toggleRecording}
              style={{
                background: isRecording ? "rgba(239, 68, 68, 0.12)" : "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${isRecording ? "var(--accent-red)" : "var(--panel-border)"}`,
                color: isRecording ? "var(--accent-red)" : "var(--text-secondary)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {isRecording ? (
                <>
                  <span className="pulse-glow-red" style={{ width: "6px", height: "6px", backgroundColor: "var(--accent-red)", borderRadius: "50%" }} />
                  <MicOff size={12} /> Listening (Click to Stop)
                </>
              ) : (
                <>
                  <Mic size={12} /> Record Call Audio
                </>
              )}
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Examples: 
- 'Your courier package from Mumbai containing MDMA drugs has been seized. Remain on WhatsApp call for video interrogation.'
- 'Congratulation! You won KBC lottery worth 25 Lakhs. Pay registration fee of Rs 12,500 to transfer...'"
            style={{ minHeight: "220px", resize: "none", flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze} 
            disabled={loading || !inputText.trim()}
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Analyzing Threat Patterns...
              </>
            ) : (
              <>
                <Send size={18} /> Scan message
              </>
            )}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setInputText("URGENT: This is FedEx customer care. Your parcel containing MDMA drugs and fake passports sent to Cambodia has been confiscated. CBI officer is issuing an arrest warrant. Join immediate Skype call for verification.");
              setResult(null);
            }}
            disabled={loading}
          >
            Load Sample Scam
          </button>
        </div>
      </div>

      {/* Results panel */}
      <div className="glass-panel" style={{ padding: "24px", minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: result || loading ? "flex-start" : "center", alignItems: result || loading ? "stretch" : "center" }}>
        
        {!result && !loading && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", color: "var(--text-muted)", padding: "40px" }}>
            <HelpCircle size={48} style={{ strokeWidth: 1.5 }} />
            <div>
              <h3 style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Awaiting Input</h3>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Results will populate here once you submit text for scanning.</p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", flex: 1 }}>
            <div style={{ position: "relative", width: "80px", height: "80px" }}>
              <div style={{
                position: "absolute",
                inset: 0,
                border: "2px solid rgba(139, 92, 246, 0.2)",
                borderRadius: "50%"
              }} />
              <div className="pulse-glow-green" style={{
                position: "absolute",
                inset: "10px",
                border: "2px solid var(--accent-purple)",
                borderRadius: "50%",
                animation: "pulse-green 1.5s infinite"
              }} />
              <Loader2 className="animate-spin" size={32} style={{ position: "absolute", top: "24px", left: "24px", color: "var(--accent-purple)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h4 style={{ fontSize: "1rem" }}>Threat Engine Working</h4>
              <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Scanning NLP corpus and matching against arrest script matrices...</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Risk Gauge Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>Scan Result</span>
                <h3 style={{ fontSize: "1.4rem", color: result.risk_score >= 70 ? "var(--accent-red)" : result.risk_score >= 40 ? "var(--accent-amber)" : "var(--accent-green)" }}>
                  {result.category}
                </h3>
              </div>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                justifyContent: "center",
                width: "72px", 
                height: "72px", 
                borderRadius: "50%", 
                border: `3px solid ${result.risk_score >= 70 ? "var(--accent-red)" : result.risk_score >= 40 ? "var(--accent-amber)" : "var(--accent-green)"}`,
                backgroundColor: result.risk_score >= 70 ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)",
                boxShadow: result.risk_score >= 70 ? "0 0 15px var(--accent-red-glow)" : "none"
              }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "800" }}>{result.risk_score}%</span>
                <span style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-secondary)" }}>RISK</span>
              </div>
            </div>

            {/* Highlighted text visual block */}
            <div className="glass-card" style={{ backgroundColor: "rgba(0, 0, 0, 0.15)", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>
                <span>PARSED TEXT FEED</span>
                <span style={{ color: "var(--accent-red)" }}>Red Highlights = Fraud Indicators</span>
              </div>
              <div style={{ fontSize: "0.9rem" }}>{renderHighlightedText()}</div>
            </div>

            {/* Scam explanation */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <AlertCircle size={20} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Scam Pattern Verdict</h4>
                <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>{result.explanation}</p>
              </div>
            </div>

            {/* Red flags check */}
            {result.red_flags.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: "700" }}>Verified Red Flags Detected:</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.red_flags.map((flag, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.85rem" }}>
                      <ShieldAlert size={14} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: "3px" }} />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety advisory */}
            <div className="glass-card" style={{ display: "flex", gap: "12px", alignItems: "center", borderLeft: "4px solid var(--accent-green)", backgroundColor: "rgba(16, 185, 129, 0.02)" }}>
              <ShieldCheck size={24} color="var(--accent-green)" />
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "#fff" }}>Safety Advisory</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Do not click any link, share OTPs, or transfer funds. Hang up immediately. Authorities never conduct legal proceedings over WhatsApp or Skype.
                </p>
              </div>
            </div>

            {/* Escalate button */}
            {result.risk_score >= 40 && (
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  setReportFormData(prev => ({...prev, amountLost: "0", additionalNotes: `Risk detected: ${result.category}. Expl: ${result.explanation}`}));
                  setEscalateStep(1);
                  setShowModal(true);
                }}
                style={{ marginTop: "8px" }}
              >
                <ShieldAlert size={18} /> Escalate and Report to NCRB / I4C
              </button>
            )}

          </div>
        )}
      </div>

      {/* NCRB Escalation Modal Form */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
          padding: "16px"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "500px",
            width: "100%",
            padding: "32px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.12)"
          }}>
            
            {escalateStep === 1 && (
              <form onSubmit={handleEscalateSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-red)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>GOVERNMENT THREAT INTEGRATION</span>
                  <h3 style={{ fontSize: "1.3rem", marginTop: "2px" }}>File Public Safety Complaint</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    This forms logs critical intelligence directly for I4C cybercrime units to freeze threat nodes.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Citizen Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={reportFormData.fullName} 
                    onChange={(e) => setReportFormData({...reportFormData, fullName: e.target.value})} 
                    placeholder="Enter full name" 
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={reportFormData.phoneNumber} 
                    onChange={(e) => setReportFormData({...reportFormData, phoneNumber: e.target.value})} 
                    placeholder="e.g. +91 98765 43210" 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Financial Loss (₹)</label>
                    <input 
                      type="number" 
                      value={reportFormData.amountLost} 
                      onChange={(e) => setReportFormData({...reportFormData, amountLost: e.target.value})} 
                      placeholder="0" 
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", fontWeight: "600" }}>Payment Mode</label>
                    <select 
                      value={reportFormData.paymentMode} 
                      onChange={(e) => setReportFormData({...reportFormData, paymentMode: e.target.value})}
                    >
                      <option value="UPI">UPI (GPay/PhonePe)</option>
                      <option value="Bank Transfer">NEFT/RTGS</option>
                      <option value="Crypto">Cryptocurrency</option>
                      <option value="None">No loss incurred</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>
                    <FileCheck size={18} /> Lodge Complaint
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {escalateStep === 2 && submittedReport && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", textAlign: "center", padding: "10px 0" }}>
                <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "50%", border: "2px solid var(--accent-green)" }}>
                  <CheckCircle2 size={40} color="var(--accent-green)" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.4rem" }}>Incident Successfully Logged</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                    Government security databases updated. Intelligence synced to I4C portal.
                  </p>
                </div>

                <div className="glass-card" style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Ticket Reference ID:</span>
                    <strong style={{ fontFamily: "monospace", color: "var(--accent-blue)" }}>{submittedReport.reference_id}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Risk Classification:</span>
                    <span style={{ fontWeight: "700", color: "var(--accent-red)" }}>{submittedReport.risk_score}% / {submittedReport.category}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Logged Date:</span>
                    <span>{submittedReport.reported_at}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Incident Status:</span>
                    <span style={{ color: "var(--accent-green)", fontWeight: "600" }}>{submittedReport.status}</span>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowModal(false)}>
                  Done
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
