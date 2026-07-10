import React, { useState } from "react";
import { Shield, LayoutDashboard, MessageSquareText, Landmark, ShieldCheck, Key } from "lucide-react";
import Dashboard from "./components/Dashboard";
import FraudShield from "./components/FraudShield";
import CurrencyScanner from "./components/CurrencyScanner";
import PrivacyCenter from "./components/PrivacyCenter";

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div>
      {/* Sticky Header Navigation */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 15, 30, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          height: "72px"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setTab("dashboard")}>
            <div style={{
              background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(139, 92, 246, 0.25)"
            }}>
              <Shield size={20} color="#fff" />
            </div>
            <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Suraksha<span style={{ color: "var(--accent-blue)" }}>Trust</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setTab("dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "none",
                background: tab === "dashboard" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                borderRadius: "8px",
                color: tab === "dashboard" ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            
            <button
              onClick={() => setTab("shield")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "none",
                background: tab === "shield" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                borderRadius: "8px",
                color: tab === "shield" ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <MessageSquareText size={16} /> Citizen Fraud Shield
            </button>

            <button
              onClick={() => setTab("scanner")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "none",
                background: tab === "scanner" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                borderRadius: "8px",
                color: tab === "scanner" ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Landmark size={16} /> Currency Scanner
            </button>

            <button
              onClick={() => setTab("privacy")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "none",
                background: tab === "privacy" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                borderRadius: "8px",
                color: tab === "privacy" ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <Key size={16} /> Privacy Center
            </button>
          </nav>

          {/* Health status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="glass-card">
            <span className="pulse-glow-green" style={{
              width: "8px",
              height: "8px",
              backgroundColor: "var(--accent-green)",
              borderRadius: "50%"
            }} />
            <span style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Secure Network Online
            </span>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="container" style={{ padding: "32px 16px", minHeight: "calc(100vh - 172px)" }}>
        {tab === "dashboard" && <Dashboard setTab={setTab} />}
        {tab === "shield" && <FraudShield />}
        {tab === "scanner" && <CurrencyScanner />}
        {tab === "privacy" && <PrivacyCenter />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.04)",
        padding: "24px 16px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.8rem"
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <ShieldCheck size={14} color="var(--accent-blue)" />
          <span>SurakshaTrust Shield v1.0.0 — Unified Digital Public Safety Network</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          Developed for AI-based scam interception and public security. Direct data integrations comply with I4C/NCRB security framework protocols.
        </p>
      </footer>
    </div>
  );
}
