import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Multer — accept PDF, DOC, DOCX, TXT ───────────────────────
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/pdf|msword|wordprocessingml|plain/)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX or TXT files are allowed'));
    }
  },
});

// ── Gemini client ───────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── Helper: extract text from uploaded file ────────────────────
async function extractText(filePath, mimetype, originalName) {
  const buffer = fs.readFileSync(filePath);

  // PDF
  if (mimetype === 'application/pdf' || originalName.endsWith('.pdf')) {
    try {
      // Dynamic import to handle ESM compatibility
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const data = await pdfParse(buffer);
      if (!data.text || data.text.trim().length < 50) {
        throw new Error('Extracted text too short');
      }
      return data.text;
    } catch (pdfErr) {
      console.warn('[extractText] pdf-parse failed:', pdfErr.message, '— falling back to raw text');
      // Fallback: try to extract readable ASCII from the raw PDF buffer
      const rawText = buffer.toString('latin1').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/ {3,}/g, ' ');
      if (rawText.trim().length > 50) return rawText;
      throw new Error('Could not extract text from this PDF. It may be scanned/image-based or corrupted. Please try a .txt or .docx version.');
    }
  }

  // Plain text
  if (mimetype === 'text/plain' || originalName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  // DOC/DOCX — extract raw text (basic; for full fidelity use mammoth)
  // For now, read as utf-8 and strip binary noise
  return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/ {3,}/g, ' ');
}

// ── Prompt builder ─────────────────────────────────────────────
function buildPrompt(resumeText, targetRole) {
  const roleContext = targetRole
    ? `The candidate is targeting: "${targetRole}".`
    : 'No specific target role was provided — analyze for general corporate suitability.';

  return `
You are an elite career coach and resume expert with 20 years of experience at top-tier recruiting firms. You have deep knowledge of Applicant Tracking Systems (ATS), 2026 hiring trends, and what Fortune 500 recruiters look for.

${roleContext}

Analyze the following resume and return a **strictly valid JSON object** (no markdown, no explanation outside the JSON) with this exact schema:

{
  "overallScore": <number 0-100>,
  "grade": <"Excellent" | "Good" | "Fair" | "Needs Work">,
  "sections": [
    {
      "id": <"contact" | "summary" | "experience" | "skills" | "education" | "ats">,
      "label": <string>,
      "score": <number 0-100>,
      "status": <"strong" | "improve" | "critical">,
      "issues": [<string>],
      "suggestions": [<string>],
      "rewrite": <string | null>
    }
  ],
  "trendingKeywords": [<string>],
  "correctedResume": <string — a complete, fully rewritten, ATS-optimized professional resume in plain text using the candidate's actual information from the original but strictly correcting ANY AND ALL spelling or grammatical errors>
}

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
${resumeText.substring(0, 8000)}
---
`;
}

// ── POST /api/analyze-resume ───────────────────────────────────
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  const file = req.file;
  const { targetRole = '' } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No resume file uploaded.' });
  }

  try {
    // 1. Extract text
    const resumeText = await extractText(file.path, file.mimetype, file.originalname);

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract readable text from the file. Please try a plain .txt or copy-paste format.' });
    }

    // 2. Call Gemini
    const prompt = buildPrompt(resumeText, targetRole);
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // 3. Parse JSON — strip any accidental markdown fences
    const jsonString = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const analysis = JSON.parse(jsonString);

    // 4. Validate required shape
    if (!analysis.overallScore || !Array.isArray(analysis.sections)) {
      throw new Error('Gemini returned an unexpected response shape.');
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('[analyze-resume] Error:', err.message);
    res.status(500).json({ error: err.message || 'AI analysis failed. Please try again.' });
  } finally {
    // Clean up uploaded file
    if (file?.path) {
      fs.unlink(file.path, () => {});
    }
  }
});

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const keySet = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({ status: 'ok', geminiKeyConfigured: keySet });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Interview AI Backend running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️   GEMINI_API_KEY is not set — add it to backend/.env');
  } else {
    console.log('✅  Gemini API key loaded');
  }
});
