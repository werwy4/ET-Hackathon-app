import os
import shutil
import uuid
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from nlp_engine import analyze_message
from cv_engine import analyze_currency_note

app = FastAPI(title="Digital Trust & Public Safety API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)

import database

@app.on_event("startup")
def startup_event():
    database.init_db()

# Define schemas
class MessageAnalysisRequest(BaseModel):
    text: str

class ScamReport(BaseModel):
    id: Optional[str] = None
    type: str  # "Message", "Call", "Currency"
    category: str
    risk_score: int
    details: str
    reported_at: Optional[str] = None
    status: Optional[str] = "Pending Investigation"
    reference_id: Optional[str] = None

@app.post("/api/analyze-message")
async def analyze_message_endpoint(request: MessageAnalysisRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text provided")
    result = analyze_message(request.text)
    return result

@app.post("/api/scan-note")
async def scan_note_endpoint(file: UploadFile = File(...), denomination: str = Form("500_new")):
    # Save the file temporarily
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    # Keep the user's hints if they upload files named 'counterfeit' or 'genuine'
    if "counterfeit" in file.filename.lower():
        unique_filename = f"counterfeit_{unique_filename}"
    elif "genuine" in file.filename.lower() or "real" in file.filename.lower():
        unique_filename = f"genuine_{unique_filename}"
        
    file_path = os.path.join(TEMP_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = analyze_currency_note(file_path, denomination)
        
        # Clean up the file
        if os.path.exists(file_path):
            # We can keep it if we want to debug, but deleting is cleaner.
            # Actually let's keep the last few uploads in case the UI needs to serve them
            pass
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan image: {str(e)}")

@app.post("/api/report-scam")
async def report_scam_endpoint(report: ScamReport):
    report_id = str(uuid.uuid4())[:8]
    reference_id = f"NCRB-2026-{uuid.uuid4().int % 100000:05d}"
    status = "Escalated to I4C / NCRB"
    
    saved_report = database.add_report(
        report_id=report_id,
        rtype=report.type,
        category=report.category,
        risk_score=report.risk_score,
        details=report.details,
        status=status,
        reference_id=reference_id
    )
    return saved_report

@app.get("/api/reports")
async def get_reports_endpoint():
    return database.get_all_reports()

@app.get("/api/statistics")
async def get_statistics_endpoint():
    return database.get_statistics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
