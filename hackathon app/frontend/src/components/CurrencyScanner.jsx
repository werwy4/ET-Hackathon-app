import React, { useState, useRef } from "react";
import { Landmark, Upload, Loader2, CheckCircle2, XCircle, AlertTriangle, Eye, ShieldAlert, ArrowRight } from "lucide-react";

export default function CurrencyScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [escalated, setEscalated] = useState(false);
  const [denomination, setDenomination] = useState("500_new");
  const [uploadedName, setUploadedName] = useState("");
  
  const fileInputRef = useRef(null);

  const processImageFile = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanning(true);
    setResult(null);
    setEscalated(false);

    // Prepare multipart form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("denomination", denomination);

    try {
      const response = await fetch("/api/scan-note", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
      if (data.aligned_image) {
        setPreviewUrl(data.aligned_image);
      }
    } catch (err) {
      console.error("Error uploading note image:", err);
      // Fallback response for offline/mock demo
      setResult({
        verdict: "SUSPECT / COUNTERFEIT",
        confidence: 20.0,
        passed_features: 1,
        total_features: 5,
        features: [
          { key: "security_thread", name: "Security Thread", box: [0.64, 0.0, 0.03, 1.0], status: "Failed", details: "Thread is printed directly without color transition." },
          { key: "watermark", name: "Watermark", box: [0.22, 0.22, 0.16, 0.53], status: "Failed", details: "Watermark contains high contrast screen pattern." },
          { key: "bleed_lines", name: "Bleed Lines & Tactile Marks", box: [0.01, 0.25, 0.98, 0.50], status: "Failed", details: "No raised Intaglio edges detected." },
          { key: "serial_number", name: "Serial Number", box: [0.72, 0.78, 0.24, 0.14], status: "Verified", details: "Ascending size is within legal margin." },
          { key: "ashoka_pillar", name: "Ashoka Pillar Emblem", box: [0.82, 0.25, 0.12, 0.32], status: "Failed", details: "Ink thickness is below threshold." }
        ]
      });
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedName(file.name);
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Helper to load sample files directly from public directory
  const loadSampleNote = async (filename, isCounterfeit) => {
    try {
      setScanning(true);
      setResult(null);
      setEscalated(false);
      setPreviewUrl(`/${filename}`);
      
      const response = await fetch(`/${filename}`);
      const blob = await response.blob();
      const mockFile = new File([blob], isCounterfeit ? "counterfeit_500.png" : "genuine_500.png", { type: "image/png" });
      
      setSelectedFile(mockFile);
      setUploadedName(mockFile.name);
      
      // Upload mock file
      const formData = new FormData();
      formData.append("file", mockFile);
      formData.append("denomination", denomination);
      
      const uploadResponse = await fetch("/api/scan-note", {
        method: "POST",
        body: formData
      });
      const data = await uploadResponse.json();
      setResult(data);
      if (data.aligned_image) {
        setPreviewUrl(data.aligned_image);
      }
    } catch (err) {
      console.error("Error loading sample:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleEscalateCurrency = async () => {
    if (!result) return;
    try {
      const payload = {
        type: "Currency",
        category: `Counterfeit / Invalid Note - ${denomination.replace("_", " ")}`,
        risk_score: 95,
        details: `Suspect note submitted. Failed features: ${result.features.filter(f => f.status === "Failed").map(f => f.name).join(", ")}. Confidence: ${100 - result.confidence}% counterfeit likelihood.`
      };
      
      await fetch("/api/report-scam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setEscalated(true);
    } catch (err) {
      console.error("Error reporting counterfeit note:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Landmark size={24} color="var(--accent-blue)" /> Counterfeit Currency Scanner
        </h2>
        <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
          Verify the authenticity of Indian currency notes and detect invalid/withdrawn notes. Supports new ₹500, ₹200, ₹100, ₹50, ₹20, ₹10 notes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Image Canvas & Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="glass-panel" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700" }}>Upload Currency Image</span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minWidth: "180px" }}
                >
                  {uploadedName ? "Upload Another File" : "Choose File"}
                </button>
                <span style={{ color: "var(--text-primary)", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "320px" }}>
                  {uploadedName || "No file selected yet"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: "18px", marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-secondary)" }}>
              Select Note Denomination
            </label>
            <select
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-primary)", appearance: "none" }}
            >
              <option value="500_new">₹500 (New / Valid)</option>
              <option value="200_new">₹200 (New / Valid)</option>
              <option value="100_new">₹100 (New / Valid)</option>
              <option value="50_new">₹50 (New / Valid)</option>
              <option value="20_new">₹20 (New / Valid)</option>
              <option value="10_new">₹10 (New / Valid)</option>
              <option value="500_old">₹500 (Old Series / Invalid)</option>
              <option value="1000_old">₹1000 (Old Series / Invalid)</option>
              <option value="2000">₹2000 (Invalid)</option>
            </select>
          </div>

          <div 
            className="glass-panel" 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ 
              position: "relative", 
              height: "320px", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              overflow: "hidden",
              borderStyle: previewUrl ? "solid" : "dashed",
              borderWidth: "2px",
              borderColor: previewUrl ? "var(--panel-border)" : "rgba(59, 130, 246, 0.4)",
              backgroundColor: "rgba(0, 0, 0, 0.25)"
            }}
          >
            {/* Background Canvas Overlays */}
            {previewUrl ? (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img 
                  src={previewUrl} 
                  alt="Currency Note" 
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} 
                />
                
                {/* Laser scan lines */}
                {scanning && <div className="scan-line" />}

                {/* Highlight Overlays (only visible when not scanning and result is available) */}
                {result && !scanning && result.features && result.features.map((feat) => {
                  const [x, y, w, h] = feat.box;
                  const isHovered = hoveredFeature === feat.key;
                  const isPassed = feat.status === "Verified";
                  
                  return (
                    <div 
                      key={feat.key}
                      style={{
                        position: "absolute",
                        left: `${x * 100}%`,
                        top: `${y * 100}%`,
                        width: `${w * 100}%`,
                        height: `${h * 100}%`,
                        border: isHovered 
                          ? `3px dashed ${isPassed ? "var(--accent-green)" : "var(--accent-red)"}` 
                          : `1.5px solid ${isPassed ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.35)"}`,
                        backgroundColor: isHovered 
                          ? `rgba(${isPassed ? "16, 185, 129" : "239, 68, 68"}, 0.12)` 
                          : "transparent",
                        boxShadow: isHovered ? `0 0 15px ${isPassed ? "var(--accent-green-glow)" : "var(--accent-red-glow)"}` : "none",
                        transition: "all 0.15s ease",
                        pointerEvents: "none",
                        zIndex: 10
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "12px", 
                  cursor: "pointer",
                  padding: "40px",
                  textAlign: "center"
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <Upload size={40} color="var(--accent-blue)" style={{ opacity: 0.8 }} />
                <div>
                  <h4 style={{ fontSize: "1rem" }}>Upload Currency Image</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Drag & drop here or click to browse. Supports JPG/PNG.
                  </p>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>

          {/* Quick Demo Sample Note Buttons */}
          <div className="glass-panel" style={{ padding: "16px" }}>
            <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
              Quick Demo Note Templates
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => loadSampleNote("genuine_500.png", false)}
                disabled={scanning}
                style={{ fontSize: "0.85rem", padding: "10px", borderColor: "rgba(16, 185, 129, 0.3)" }}
              >
                <CheckCircle2 size={14} color="var(--accent-green)" /> Genuine ₹500 Note
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => loadSampleNote("counterfeit_500.png", true)}
                disabled={scanning}
                style={{ fontSize: "0.85rem", padding: "10px", borderColor: "rgba(239, 68, 68, 0.3)" }}
              >
                <XCircle size={14} color="var(--accent-red)" /> Counterfeit ₹500 Note
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Verification Results */}
        <div className="glass-panel" style={{ padding: "24px", minHeight: "440px", display: "flex", flexDirection: "column" }}>
          {result && result.invalid_reason && (
            <div className="glass-card" style={{ padding: "16px", marginBottom: "18px", borderLeft: "4px solid var(--accent-red)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
              <strong style={{ display: "block", marginBottom: "6px", color: "var(--accent-red)" }}>Invalid Note Detected</strong>
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6" }}>{result.invalid_reason}</p>
            </div>
          )}
          
          {!result && !scanning && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "16px", color: "var(--text-muted)", padding: "40px", textAlign: "center" }}>
              <Eye size={40} style={{ strokeWidth: 1.5 }} />
              <div>
                <h4 style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Awaiting Note Upload</h4>
                <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                  Select or drag an image or use the demo templates to analyze security watermarks.
                </p>
              </div>
            </div>
          )}

          {scanning && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "16px" }}>
              <Loader2 className="animate-spin" size={32} color="var(--accent-blue)" />
              <div style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: "0.95rem" }}>Running Verification Pipeline</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Analyzing color shifts, counting bleed lines, and measuring serial dimensions...
                </p>
              </div>
            </div>
          )}

          {result && !scanning && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Verdict Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>Note Verdict</span>
                  <h3 style={{ 
                    fontSize: "1.3rem", 
                    color: result.verdict.includes("GENUINE") ? "var(--accent-green)" : "var(--accent-red)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "2px"
                  }}>
                    {result.verdict.includes("GENUINE") ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    {result.verdict}
                  </h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Trust Metric</span>
                  <div style={{ fontSize: "1.4rem", fontWeight: "800", color: result.verdict.includes("GENUINE") ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {result.confidence}%
                  </div>
                </div>
              </div>

              {result.reason && (
                <div className="glass-card" style={{ padding: "12px", borderLeft: `3px solid ${result.verdict.includes("GENUINE") ? "var(--accent-green)" : "var(--accent-red)"}`, backgroundColor: "rgba(255,255,255,0.01)" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Verification Summary</span>
                  <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: "1.4" }}>{result.reason}</p>
                </div>
              )}

              {/* Interactive Features List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>
                  Security Verification Checklist
                </span>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.features && result.features.map((feat) => {
                    const isPassed = feat.status === "Verified";
                    return (
                      <div 
                        key={feat.key}
                        className="glass-card"
                        onMouseEnter={() => setHoveredFeature(feat.key)}
                        onMouseLeave={() => setHoveredFeature(null)}
                        style={{ 
                          padding: "12px", 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "4px",
                          cursor: "pointer",
                          borderColor: hoveredFeature === feat.key 
                            ? (isPassed ? "var(--accent-green)" : "var(--accent-red)") 
                            : "rgba(255, 255, 255, 0.04)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{feat.name}</span>
                          <span style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "700", 
                            color: isPassed ? "var(--accent-green)" : "var(--accent-red)",
                            backgroundColor: isPassed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {feat.status}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                          {feat.details}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Escalate block for counterfeit notes */}
              {!result.verdict.includes("GENUINE") && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {escalated ? (
                    <div className="glass-card" style={{ display: "flex", gap: "10px", alignItems: "center", borderLeft: "4px solid var(--accent-green)", backgroundColor: "rgba(16, 185, 129, 0.02)" }}>
                      <CheckCircle2 size={18} color="var(--accent-green)" />
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-green)", fontWeight: "600" }}>
                        Counterfeit reported! Logged successfully in security feed.
                      </span>
                    </div>
                  ) : (
                    <button className="btn btn-danger" onClick={handleEscalateCurrency}>
                      <ShieldAlert size={16} /> Escalate: Log Counterfeit to Database
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minWidth: "180px" }}
                >
                  Upload another file
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
