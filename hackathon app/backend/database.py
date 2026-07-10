import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "suraksha_trust.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            details TEXT NOT NULL,
            reported_at TEXT NOT NULL,
            status TEXT NOT NULL,
            reference_id TEXT NOT NULL
        )
    """)
    conn.commit()

    # Pre-seed if empty
    cursor.execute("SELECT COUNT(*) FROM reports")
    count = cursor.fetchone()[0]
    if count == 0:
        default_reports = [
            (
                "1",
                "Message",
                "Digital Arrest",
                95,
                "Claimed to be CBI Mumbai Customs regarding MDMA found in a FedEx package. Demanded Rs. 5 Lakhs transfer.",
                "2026-06-23 09:30 AM",
                "Escalated to I4C",
                "NCRB-2026-98124"
            ),
            (
                "2",
                "Call",
                "Job Scam",
                88,
                "Telegram rating task scam. Asked for Rs. 50,000 security deposit to upgrade to VIP level.",
                "2026-06-22 04:15 PM",
                "Under Investigation",
                "NCRB-2026-97645"
            ),
            (
                "3",
                "Currency",
                "Counterfeit Rs. 500 Note",
                90,
                "Detected fake note at local retail store. Security thread printed directly with flat colors.",
                "2026-06-22 11:05 AM",
                "Logged for Intelligence",
                "NCRB-2026-97423"
            )
        ]
        cursor.executemany("""
            INSERT INTO reports (id, type, category, risk_score, details, reported_at, status, reference_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, default_reports)
        conn.commit()
    
    conn.close()

def add_report(report_id, rtype, category, risk_score, details, status, reference_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now()
    reported_at = now.strftime("%Y-%m-%d %I:%M %p")
    
    cursor.execute("""
        INSERT INTO reports (id, type, category, risk_score, details, reported_at, status, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (report_id, rtype, category, risk_score, details, reported_at, status, reference_id))
    conn.commit()
    conn.close()
    return {
        "id": report_id,
        "type": rtype,
        "category": category,
        "risk_score": risk_score,
        "details": details,
        "reported_at": reported_at,
        "status": status,
        "reference_id": reference_id
    }

def get_all_reports():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports ORDER BY reported_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_statistics():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports")
    rows = cursor.fetchall()
    conn.close()
    
    reports = [dict(row) for row in rows]
    categories = {}
    for r in reports:
        cat = r.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + 1
        
    category_chart_data = [{"name": name, "value": val} for name, val in categories.items()]
    
    # Mock some time series data for the dashboard
    threat_trends = [
        {"month": "Jan", "Digital Arrest": 12, "Job Scams": 24, "Counterfeits": 8},
        {"month": "Feb", "Digital Arrest": 19, "Job Scams": 35, "Counterfeits": 11},
        {"month": "Mar", "Digital Arrest": 31, "Job Scams": 48, "Counterfeits": 9},
        {"month": "Apr", "Digital Arrest": 45, "Job Scams": 62, "Counterfeits": 15},
        {"month": "May", "Digital Arrest": 72, "Job Scams": 78, "Counterfeits": 14},
        {"month": "Jun", "Digital Arrest": 115, "Job Scams": 94, "Counterfeits": 19}
    ]
    
    return {
        "total_reports": len(reports),
        "categories": category_chart_data,
        "trends": threat_trends,
        "critical_alerts": [
            "Alert: CBI Digital Arrest campaigns impersonating narcotics officers spike by 38% this week.",
            "Warning: High-quality fake ₹500 notes (Series 2022) with misaligned serial numbers reported in retail hubs.",
            "Notice: Fraudsters targeting WFH job seekers via WhatsApp rating tasks."
        ]
    }
