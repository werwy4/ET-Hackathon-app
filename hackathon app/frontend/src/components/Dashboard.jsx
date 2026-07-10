import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Cpu, Landmark, Clock, FileText, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";

export default function Dashboard({ setTab }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("http://localhost:8000/api/statistics");
        const statsData = await statsRes.json();
        setStats(statsData);

        const reportsRes = await fetch("http://localhost:8000/api/reports");
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Simple SVG Line Chart Builder for Trends
  const renderTrendChart = (trends) => {
    if (!trends || trends.length === 0) return null;
    const width = 500;
    const height = 180;
    const padding = 25;
    
    // Find max value in trends
    let maxVal = 0;
    trends.forEach(d => {
      maxVal = Math.max(maxVal, d["Digital Arrest"] || 0, d["Job Scams"] || 0);
    });
    maxVal = maxVal ? maxVal * 1.15 : 100; // 15% headroom

    const getPoints = (key) => {
      return trends.map((d, i) => {
        const x = padding + (i * (width - padding * 2) / (trends.length - 1));
        const y = height - padding - (d[key] * (height - padding * 2) / maxVal);
        return `${x},${y}`;
      }).join(" ");
    };

    const arrestPoints = getPoints("Digital Arrest");
    const jobPoints = getPoints("Job Scams");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
          const y = padding + r * (height - padding * 2);
          const gridVal = Math.round(maxVal * (1 - r));
          return (
            <g key={idx} opacity="0.15">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#fff" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding - 5} y={y + 4} fill="#fff" fontSize="10" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}
        {/* Months labels */}
        {trends.map((d, i) => {
          const x = padding + (i * (width - padding * 2) / (trends.length - 1));
          return (
            <text key={i} x={x} y={height - 5} fill="#94a3b8" fontSize="10" textAnchor="middle" opacity="0.8">
              {d.month}
            </text>
          );
        })}
        {/* Trend Lines */}
        <polyline fill="none" stroke="hsl(263, 84%, 55%)" strokeWidth="3" strokeLinecap="round" points={arrestPoints} />
        <polyline fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="3" strokeLinecap="round" points={jobPoints} />
        {/* Dots */}
        {trends.map((d, i) => {
          const x = padding + (i * (width - padding * 2) / (trends.length - 1));
          const yArrest = height - padding - (d["Digital Arrest"] * (height - padding * 2) / maxVal);
          const yJob = height - padding - (d["Job Scams"] * (height - padding * 2) / maxVal);
          return (
            <g key={i}>
              <circle cx={x} cy={yArrest} r="4" fill="hsl(263, 84%, 55%)" stroke="#000" strokeWidth="1" />
              <circle cx={x} cy={yJob} r="4" fill="hsl(217, 91%, 60%)" stroke="#000" strokeWidth="1" />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
            Protecting Citizens in the Digital Public Square
          </h2>
          <p style={{ maxWidth: "700px" }}>
            Defeating AI-driven counterfeits, digital arrest impersonations, and coordinate financial scams using local CV analysis and NLP threat intelligence layers.
          </p>
        </div>
        <div style={{
          position: "absolute",
          right: "-30px",
          bottom: "-30px",
          opacity: 0.05,
          pointerEvents: "none"
        }}>
          <Shield size={240} color="#fff" />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        <div className="glass-panel glow-purple" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", cursor: "pointer" }} onClick={() => setTab("shield")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", padding: "12px", borderRadius: "12px" }}>
              <Cpu size={28} color="hsl(263, 84%, 55%)" />
            </div>
            <span style={{ fontSize: "0.8rem", color: "hsl(263, 84%, 55%)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>CITIZEN SHIELD</span>
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>Check Suspicious Message</h3>
            <p style={{ fontSize: "0.9rem" }}>Paste WhatsApp threats, courier warnings, or describe suspicious calls to instantly verify scams.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "0.9rem", color: "hsl(263, 84%, 55%)", marginTop: "auto" }}>
            Scan messages <ArrowRight size={16} />
          </div>
        </div>

        <div className="glass-panel glow-blue" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", cursor: "pointer" }} onClick={() => setTab("scanner")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", padding: "12px", borderRadius: "12px" }}>
              <Landmark size={28} color="hsl(217, 91%, 60%)" />
            </div>
            <span style={{ fontSize: "0.8rem", color: "hsl(217, 91%, 60%)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>CURRENCY SCANNER</span>
          </div>
          <div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>Verify Currency Note</h3>
            <p style={{ fontSize: "0.9rem" }}>Upload a picture of a currency note to inspect security threads, bleed lines, and watermarks.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "0.9rem", color: "hsl(217, 91%, 60%)", marginTop: "auto" }}>
            Inspect currency note <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Threats Feed & Trends Chart Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px" }}>
        
        {/* Trend Chart */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}><Clock size={18} /> Threat Activity Trends (2026)</h3>
            <p style={{ fontSize: "0.85rem" }}>Reported cases in regional zones for major scam typologies</p>
          </div>
          <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading ? <div className="shimmer" style={{ width: "100%", height: "100%", borderRadius: "8px" }}></div> : renderTrendChart(stats?.trends)}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "4px", backgroundColor: "hsl(263, 84%, 55%)", borderRadius: "2px" }}></span> Digital Arrest Scams
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "4px", backgroundColor: "hsl(217, 91%, 60%)", borderRadius: "2px" }}></span> Task/Job Scams
            </span>
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}><AlertTriangle size={18} color="hsl(38, 92%, 50%)" /> Public Safety Threat Alerts</h3>
            <p style={{ fontSize: "0.85rem" }}>Direct feeds from National Cyber Crime portal advisories</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "200px" }}>
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: "48px", borderRadius: "8px" }}></div>)
            ) : (
              stats?.critical_alerts.map((alert, idx) => (
                <div key={idx} className="glass-card" style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px" }}>
                  <ShieldAlert size={18} color={idx === 1 ? "hsl(0, 84%, 60%)" : "hsl(38, 92%, 50%)"} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>{alert}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reports Log Table */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <FileText size={18} /> Public Safety Trust Logs
        </h3>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                <th style={{ padding: "12px 8px" }}>Reference ID</th>
                <th style={{ padding: "12px 8px" }}>Type</th>
                <th style={{ padding: "12px 8px" }}>Category</th>
                <th style={{ padding: "12px 8px" }}>Risk Score</th>
                <th style={{ padding: "12px 8px" }}>Logged Date</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "20px 0" }}>
                    <div className="shimmer" style={{ height: "40px", borderRadius: "4px" }}></div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "24px", textAnchor: "middle", color: "var(--text-muted)" }}>
                    No reports filed yet. Use Citizen Shield or Note Scanner.
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  let badgeColor = "hsl(142, 70%, 45%)";
                  let badgeBg = "rgba(16, 185, 129, 0.12)";
                  if (report.risk_score >= 80) {
                    badgeColor = "hsl(0, 84%, 60%)";
                    badgeBg = "rgba(239, 68, 68, 0.12)";
                  } else if (report.risk_score >= 40) {
                    badgeColor = "hsl(38, 92%, 50%)";
                    badgeBg = "rgba(245, 158, 11, 0.12)";
                  }

                  return (
                    <tr key={report.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)", fontSize: "0.9rem" }}>
                      <td style={{ padding: "16px 8px", fontFamily: "monospace", color: "var(--accent-blue)" }}>{report.reference_id}</td>
                      <td style={{ padding: "16px 8px" }}>{report.type}</td>
                      <td style={{ padding: "16px 8px", color: "var(--text-primary)" }}>{report.category}</td>
                      <td style={{ padding: "16px 8px" }}>
                        <span style={{ 
                          color: badgeColor, 
                          backgroundColor: badgeBg, 
                          padding: "3px 8px", 
                          borderRadius: "4px", 
                          fontSize: "0.8rem", 
                          fontWeight: "700" 
                        }}>
                          {report.risk_score}%
                        </span>
                      </td>
                      <td style={{ padding: "16px 8px", color: "var(--text-muted)" }}>{report.reported_at}</td>
                      <td style={{ padding: "16px 8px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                          <CheckCircle size={14} color="hsl(142, 70%, 45%)" /> {report.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
