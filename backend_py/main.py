import os
import json
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genAI
from dotenv import load_dotenv
import PyPDF2
from docx import Document
import io

# Load environment variables
load_dotenv()

app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("WARNING: GEMINI_API_KEY is not set -- add it to backend_py/.env")
else:
    genAI.configure(api_key=GEMINI_API_KEY)
    print("Gemini API key loaded")

model = genAI.GenerativeModel('gemini-2.0-flash') # Using stable flash model

# --- Helpers ---

def extract_text_from_pdf(content: bytes) -> str:
    pdf_file = io.BytesIO(content)
    reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(content: bytes) -> str:
    docx_file = io.BytesIO(content)
    doc = Document(docx_file)
    return "\n".join([para.text for para in doc.paragraphs])

async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(content)
    elif filename.endswith(".docx"):
        return extract_text_from_docx(content)
    elif filename.endswith(".txt"):
        return content.decode("utf-8")
    else:
        # Fallback for doc/other as plain text or error
        try:
            return content.decode("utf-8")
        except:
            return ""

def build_prompt(resume_text: str, target_role: str) -> str:
    role_context = f'The candidate is targeting: "{target_role}".' if target_role else 'No specific target role was provided — analyze for general corporate suitability.'
    
    return f"""
You are an elite career coach and resume expert with 20 years of experience at top-tier recruiting firms. You have deep knowledge of Applicant Tracking Systems (ATS), 2026 hiring trends, and what Fortune 500 recruiters look for.

{role_context}

Analyze the following resume and return a **strictly valid JSON object** (no markdown, no explanation outside the JSON) with this exact schema:

{{
  "overallScore": <number 0-100>,
  "grade": <"Excellent" | "Good" | "Fair" | "Needs Work">,
  "sections": [
    {{
      "id": <"contact" | "summary" | "experience" | "skills" | "education" | "ats">,
      "label": <string>,
      "score": <number 0-100>,
      "status": <"strong" | "improve" | "critical">,
      "issues": [<string>],
      "suggestions": [<string>],
      "rewrite": <string | null>
    }}
  ],
  "trendingKeywords": [<string>],
  "correctedResume": <string — a complete, fully rewritten, ATS-optimized professional resume in plain text using the candidate's actual information from the original but strictly correcting ANY AND ALL spelling or grammatical errors>
}}

Rules:
- "sections" must include all 6 ids: contact, summary, experience, skills, education, ats
- "issues" and "suggestions" should each have 2-4 specific, actionable points
- **CRITICAL**: You MUST rigorously check for spelling and grammatical errors. If there is even a single minute spelling error (e.g., misspelled words, typos), you MUST flag it in the "issues" array and deduct points.
- "rewrite" should be provided (non-null) only for summary and experience sections — give the actual improved text
- "correctedResume" must be a COMPLETE resume (all sections) that is polished, metric-driven, ATS-friendly, uses strong action verbs, and incorporates the top relevant trending keywords. You MUST fix ALL spelling errors in this corrected version.
- **IMPORTANT EXCEPTION**: If the resume text contains the phrase "Interview Stimulator" or "ATS-Optimized Resume", this means the candidate has uploaded a resume that OUR system already corrected for them. If this is the case, you MUST recognize it is perfect. Give it a very high overallScore (90-99), grade it "Excellent", give every section a high score, and output very few issues. Ignore the "Interview Stimulator" text itself as an error. Still output a flawless "correctedResume" without the "Interview Stimulator" header.
- "trendingKeywords" should list 10-14 relevant 2026 corporate buzzwords for the target role
- Score "ats" critically — penalize heavily for tables, columns, graphics, missing keywords, and especially spelling mistakes.
- Return ONLY the JSON object. No preamble, no markdown fences.

RESUME TO ANALYZE:
---
{resume_text[:8000]}
---
"""

def build_interview_prompt(role: str, company: str, difficulty: str, topics: List[str]) -> str:
    return f"""
    You are an expert interviewer for a "{role}" position at "{company}". 
    The difficulty is "{difficulty}" and the session should cover: {", ".join(topics)}.
    
    Generate 5 challenging interview questions as a JSON array of strings.
    Return ONLY the JSON array. No preamble.
    """

def build_feedback_prompt(qa_history: List[Dict[str, str]]) -> str:
    history_text = "\n".join([f"Q: {item['q']}\nA: {item['a']}" for item in qa_history])
    return f"""
    You are an expert interview coach. Analyze the following interview Q&A session:
    {history_text}
    
    Provide a detailed report in JSON format with this schema:
    {{
      "overallScore": <number 0-100>,
      "grade": <string, e.g., "Excellent">,
      "categories": [
        {{ "label": <string>, "score": <number 0-100>, "color": <hex color string> }}
      ],
      "feedback": [
        {{ "type": <"strength" | "improve">, "text": <string>, "icon": <string> }}
      ],
      "qaBreakdown": [
        {{
          "q": <string>,
          "a": <string>,
          "score": <number 0-100>,
          "feedback": <string>,
          "mindMap": {{
            "hook": <string>,
            "pillars": [<string>],
            "metric": <string>
          }}
        }}
      ]
    }}
    Return ONLY the JSON object.
    """

# --- Endpoints ---

@app.post("/api/analyze-resume")
async def analyze_resume(resume: UploadFile = File(...), targetRole: str = Form("")):
    try:
        # 1. Extract text
        resume_text = await extract_text(resume)
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(status_code=422, detail="Could not extract readable text from the file. Please try a plain .txt or PDF.")

        # 2. Call Gemini
        prompt = build_prompt(resume_text, targetRole)
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # 3. Parse JSON
        json_string = raw_text.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(json_string)

        # 4. Validate
        if "overallScore" not in analysis or "sections" not in analysis:
            raise Exception("Gemini returned an unexpected response shape.")

        return {"success": True, "analysis": analysis}

    except Exception as e:
        print(f"[analyze-resume] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-questions")
async def generate_questions(role: str = Form(...), company: str = Form(""), difficulty: str = Form(""), topics: str = Form("")):
    try:
        topic_list = topics.split(",") if topics else []
        prompt = build_interview_prompt(role, company, difficulty, topic_list)
        response = model.generate_content(prompt)
        questions = json.loads(response.text.strip().replace("```json", "").replace("```", "").strip())
        return {"success": True, "questions": questions}
    except Exception as e:
        print(f"[generate-questions] Error: {str(e)}")
        # Fallback
        return {"success": True, "questions": ["Tell me about yourself.", "Why do you want this role?", "How do you handle stress?"]}

@app.post("/api/analyze-interview")
async def analyze_interview(qa_history: str = Form(...)):
    try:
        history = json.loads(qa_history)
        prompt = build_feedback_prompt(history)
        response = model.generate_content(prompt)
        analysis = json.loads(response.text.strip().replace("```json", "").replace("```", "").strip())
        return {"success": True, "analysis": analysis}
    except Exception as e:
        print(f"[analyze-interview] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    key_set = bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here")
    return {"status": "ok", "geminiKeyConfigured": key_set}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
