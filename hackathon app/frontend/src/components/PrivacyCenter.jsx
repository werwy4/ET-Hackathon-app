import React from "react";
import { Shield, Lock, UserCheck, EyeOff, FileSearch } from "lucide-react";

export default function PrivacyCenter() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div className="glass-panel" style={{ padding: "28px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "rgba(59, 130, 246, 0.12)", display: "grid", placeItems: "center" }}>
            <Shield size={30} color="var(--accent-blue)" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Privacy Center</h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "760px" }}>
              Control what data this app collects and keep your note verification activities private.
              The system is designed to keep files local and limit sensitive data exposure.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <Lock size={22} color="var(--accent-purple)" />
            <h3 style={{ fontSize: "1.05rem" }}>Data Protection</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            Uploaded images and scan requests are processed only by the backend service. No user credentials or personal identifiers are stored in the app.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <UserCheck size={22} color="var(--accent-green)" />
            <h3 style={{ fontSize: "1.05rem" }}>Self Privacy Controls</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            Use the app without providing identity details. You can upload currency images anonymously, and only the note verification outcome is retained.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <EyeOff size={22} color="var(--accent-blue)" />
            <h3 style={{ fontSize: "1.05rem" }}>Privacy-First Design</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.75 }}>
            The app avoids tracking behavioral telemetry and does not require login. The privacy center helps you stay aware of how your data is handled.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <FileSearch size={22} color="var(--accent-blue)" />
          <h3 style={{ fontSize: "1.05rem" }}>Privacy Checklist</h3>
        </div>
        <ul style={{ listStyle: "none", paddingLeft: 0, color: "var(--text-secondary)", lineHeight: 1.9 }}>
          <li>• Upload only currency images needed for verification.</li>
          <li>• Do not share personal contact details in the note scanner.</li>
          <li>• Use the Fraud Shield only for scam messages, not sensitive personal information.</li>
          <li>• Clear browser cache if you want fresh anonymity after each session.</li>
        </ul>
      </div>
    </div>
  );
}
