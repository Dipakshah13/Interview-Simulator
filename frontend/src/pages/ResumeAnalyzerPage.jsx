import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, Sparkles, CheckCircle2,
  AlertTriangle, XCircle, ChevronDown, ChevronUp,
  Download, RefreshCw, Briefcase, Zap, Target, TrendingUp,
  Star, Clock, Award, WifiOff
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import './ResumeAnalyzerPage.css';

const API_BASE = 'http://localhost:3001';

const TRENDING_KEYWORDS_FALLBACK = [
  'Large Language Models', 'RAG Pipeline', 'TypeScript', 'System Design',
  'Kubernetes', 'CI/CD', 'Cross-functional', 'Stakeholder Management',
  'A/B Testing', 'Data-driven', 'Terraform', 'GraphQL',
];

/* ─── Download helpers ────────────────────────────────────────── */
function downloadAnalysisReport(analysis, fileName, targetRole) {
  const scoreColor = analysis.overallScore >= 75 ? '#22c55e' : analysis.overallScore >= 50 ? '#f59e0b' : '#ef4444';
  const statusColor = { strong: '#22c55e', improve: '#f59e0b', critical: '#ef4444' };

  const sectionsHtml = analysis.sections.map(s => `
    <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;border-left:4px solid ${statusColor[s.status]}">
      <div style="background:#f9fafb;padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:15px">${s.label}</strong>
        <span style="color:${statusColor[s.status]};font-weight:700">${s.score}/100</span>
      </div>
      ${s.issues.length ? `<div style="padding:12px 18px;background:#fff5f5">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin:0 0 8px">Issues</p>
        ${s.issues.map(i => `<p style="margin:4px 0;font-size:13px;color:#374151">❌ ${i}</p>`).join('')}
      </div>` : ''}
      <div style="padding:12px 18px">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin:0 0 8px">AI Recommendations</p>
        ${s.suggestions.map(sg => `<p style="margin:4px 0;font-size:13px;color:#374151">✦ ${sg}</p>`).join('')}
      </div>
      ${s.rewrite ? `<div style="padding:12px 18px;background:#eff6ff">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#6366f1;margin:0 0 8px">✨ AI-Suggested Rewrite</p>
        <pre style="font-family:inherit;font-size:13px;color:#1e3a8a;white-space:pre-wrap;margin:0">${s.rewrite}</pre>
      </div>` : ''}
    </div>`).join('');

  const keywords = (analysis.trendingKeywords || TRENDING_KEYWORDS_FALLBACK)
    .map(k => `<span style="background:#dbeafe;color:#1e40af;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600">${k}</span>`)
    .join(' ');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Resume Analysis Report — ${fileName}</title>
<style>body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;padding:32px;color:#111827;max-width:800px;margin:0 auto}
@media print{body{padding:16px}}</style></head><body>
<div style="background:linear-gradient(135deg,#003178,#0d47a1);border-radius:16px;padding:32px;color:white;margin-bottom:32px">
  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;opacity:0.7">Interview Stimulator · Resume Analyzer Report</p>
  <h1 style="margin:0 0 8px;font-size:28px;font-weight:800">${fileName}</h1>
  ${targetRole ? `<p style="margin:0;opacity:0.8;font-size:14px">🎯 Target Role: ${targetRole}</p>` : ''}
  <div style="margin-top:24px;display:flex;align-items:center;gap:24px">
    <div>
      <p style="margin:0;font-size:48px;font-weight:800;color:${scoreColor}">${analysis.overallScore}</p>
      <p style="margin:0;font-size:12px;opacity:0.6">/ 100 Overall Score</p>
    </div>
    <div>
      <p style="margin:0;font-size:22px;font-weight:700">${analysis.grade}</p>
      <p style="margin:0;font-size:12px;opacity:0.6">Generated ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</div>
<h2 style="font-size:18px;margin:0 0 16px">Section Analysis</h2>
${sectionsHtml}
<h2 style="font-size:18px;margin:24px 0 12px">2026
 Trending Keywords</h2>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:40px">${keywords}</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resume_Report_${fileName.replace(/\.[^.]+$/, '')}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateResumeHtml(analysis, fileName) {
  const escapeHtml = (unsafe) => unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const safeContent = escapeHtml(analysis.correctedResume);
  
  const formattedContent = safeContent
    .replace(/^([A-Z][A-Za-z\s&:-]+)$/gm, (match) => {
      if (match.length < 40 && /(Experience|Education|Skills|Summary|Objective|Projects|Certifications|Profile|History|Highlights)/i.test(match)) {
        return `<h2 style="color:#003178;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-top:24px;font-size:16px;text-transform:uppercase;letter-spacing:1px">${match.trim()}</h2>`;
      }
      return match;
    })
    .replace(/^(.*?)\n/, '<strong style="font-size:26px;letter-spacing:-0.02em;color:#111827">$1</strong>\n'); 

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Corrected Resume — ${fileName}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; background: #f3f4f6; color: #374151; }
  .page { max-width: 850px; margin: 40px auto; background: white; padding: 60px 80px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border-radius: 8px; }
  .brand-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
  .brand-header p { margin: 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #6b7280; font-weight: 600; }
  .brand-header .badge { 
    display: inline-flex; align-items: center; gap: 6px; 
    background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%); 
    color: #1e3a8a; 
    padding: 6px 18px; 
    border-radius: 999px; 
    margin-top: 14px; 
    font-size: 13px; 
    font-weight: 800; 
    border: 1px solid #bfdbfe;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.15);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .content { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
  .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #9ca3af; }
  @media print {
    body { background: white; }
    .page { margin: 0; padding: 0; box-shadow: none; max-width: 100%; border-radius: 0; }
    .brand-header .badge { border: 1px solid #1d4ed8; box-shadow: none; }
  }
</style>
</head><body>
<div class="page">
  <div class="brand-header">
    <p>Interview Stimulator · Professional Correction Engine</p>
    <div class="badge">✨ ATS-Optimized Resume</div>
  </div>
  <div class="content">${formattedContent}</div>
  <div class="footer">
    Automatically enhanced and formatted by Gemini AI for 2026 Corporate Trends.
  </div>
</div>
</body></html>`;
}

function downloadCorrectedResumePDF(analysis, fileName) {
  if (!analysis.correctedResume) return;
  const html = generateResumeHtml(analysis, fileName);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 250);
}

function downloadCorrectedResumeDOC(analysis, fileName) {
  if (!analysis.correctedResume) return;
  const html = generateResumeHtml(analysis, fileName);
  
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Corrected_Resume_${fileName.replace(/\.[^.]+$/, '')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Score Ring ──────────────────────────────────────────────── */
function ScoreRing({ score, size = 120 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} className="resume__ring" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
    </svg>
  );
}

/* ─── Section Card ────────────────────────────────────────────── */
function SectionCard({ section }) {
  const [open, setOpen] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const statusMap = {
    strong: { icon: CheckCircle2, color: '#22c55e', bg: 'var(--color-secondary-fixed)', label: 'Strong' },
    improve: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Needs Work' },
    critical: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' },
  };
  const { icon: StatusIcon, color, bg, label } = statusMap[section.status] || statusMap.improve;

  return (
    <div className={`resume__section-card resume__section-card--${section.status}`}>
      <button className="resume__section-header" onClick={() => setOpen(o => !o)}
        aria-expanded={open} id={`section-btn-${section.id}`}>
        <div className="resume__section-left">
          <StatusIcon size={18} color={color} />
          <span className="resume__section-label">{section.label}</span>
        </div>
        <div className="resume__section-right">
          <span className="resume__section-score" style={{ color }}>{section.score}/100</span>
          <div className="resume__section-bar-track">
            <div className="resume__section-bar-fill" style={{ width: `${section.score}%`, background: color }} />
          </div>
          <span className="resume__section-status-chip" style={{ background: bg, color }}>{label}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="resume__section-body">
          {section.issues?.length > 0 && (
            <div className="resume__issues">
              <p className="resume__sub-label">Issues Detected</p>
              {section.issues.map((issue, i) => (
                <div key={i} className="resume__issue-item">
                  <XCircle size={13} color="#ef4444" /><span>{issue}</span>
                </div>
              ))}
            </div>
          )}
          <div className="resume__suggestions">
            <p className="resume__sub-label">AI Recommendations</p>
            {section.suggestions?.map((s, i) => (
              <div key={i} className="resume__suggestion-item">
                <Sparkles size={13} color="var(--color-primary-container)" /><span>{s}</span>
              </div>
            ))}
          </div>
          {section.rewrite && (
            <div className="resume__rewrite-wrap">
              <button className="resume__rewrite-toggle"
                onClick={() => setShowRewrite(r => !r)} id={`btn-rewrite-${section.id}`}>
                <Zap size={14} />
                {showRewrite ? 'Hide AI Rewrite' : 'Show AI-Powered Rewrite ✨'}
              </button>
              {showRewrite && (
                <div className="resume__rewrite-box">
                  <p className="resume__sub-label resume__sub-label--sm">Suggested Rewrite</p>
                  <pre className="resume__rewrite-text">{section.rewrite}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fileRef = useRef(null); // holds the actual File object

  const [phase, setPhase] = useState('upload'); // upload | analyzing | results
  const [fileName, setFileName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [apiError, setApiError] = useState('');

  /* ── File handling ── */
  const handleFile = useCallback((file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }
    fileRef.current = file;
    setFileName(file.name);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  /* ── Analyze ── */
  const handleAnalyze = async () => {
    if (!fileRef.current) { alert('Please upload your resume first.'); return; }
    setPhase('analyzing'); setProgress(0); setApiError('');

    // Fake progress ticks while awaiting API
    const fakeTicks = [15, 30, 50, 65, 78, 88];
    let tickIdx = 0;
    const ticker = setInterval(() => {
      if (tickIdx < fakeTicks.length) { setProgress(fakeTicks[tickIdx++]); }
      else clearInterval(ticker);
    }, 900);

    try {
      const formData = new FormData();
      formData.append('resume', fileRef.current);
      formData.append('targetRole', targetRole);

      const res = await fetch(`${API_BASE}/api/analyze-resume`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(ticker);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await res.json();
      setProgress(100);
      setTimeout(() => {
        setAnalysis(data.analysis);
        setPhase('results');
      }, 400);
    } catch (err) {
      clearInterval(ticker);
      setApiError(err.message);
      setPhase('upload');
    }
  };

  const handleReset = () => {
    setPhase('upload'); setFileName(''); setTargetRole('');
    setProgress(0); setAnalysis(null); setApiError('');
    fileRef.current = null;
  };

  const score = analysis?.overallScore ?? 0;
  const keywords = analysis?.trendingKeywords?.length ? analysis.trendingKeywords : TRENDING_KEYWORDS_FALLBACK;

  /* ── Render ── */
  return (
    <PageLayout>
      <div className="resume page-enter">

        {/* Header */}
        <header className="resume__header">
          <button id="btn-resume-back" className="resume__back"
            onClick={() => navigate('/dashboard')} aria-label="Back to Dashboard">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="resume__title">Resume Analyzer</h1>
            <p className="resume__subtitle">Powered by Gemini AI · 2026 trend-aligned</p>
          </div>
          {phase === 'results' && (
            <button id="btn-resume-reset" className="resume__refresh-btn"
              onClick={handleReset} aria-label="Analyze another resume">
              <RefreshCw size={18} />
            </button>
          )}
        </header>

        {/* API Error Banner */}
        {apiError && (
          <div className="resume__error-banner">
            <WifiOff size={16} />
            <div>
              <strong>Analysis failed</strong>
              <p>{apiError}</p>
              {apiError.toLowerCase().includes('api key') || apiError.toLowerCase().includes('gemini') ? (
                <p>Make sure your <code>GEMINI_API_KEY</code> is set in <code>backend/.env</code> and the backend is running on port 3001.</p>
              ) : null}
            </div>
          </div>
        )}

        {/* ─── UPLOAD PHASE ─── */}
        {phase === 'upload' && (
          <div className="resume__upload-phase">
            <div
              className={`resume__dropzone ${dragOver ? 'resume__dropzone--over' : ''} ${fileName ? 'resume__dropzone--filled' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button" tabIndex={0} id="resume-dropzone"
              aria-label="Upload resume file"
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
                id="resume-file-input" />
              {fileName ? (
                <>
                  <div className="resume__dropzone-icon resume__dropzone-icon--filled">
                    <FileText size={32} />
                  </div>
                  <p className="resume__dropzone-filename">{fileName}</p>
                  <p className="resume__dropzone-hint">Tap to replace</p>
                </>
              ) : (
                <>
                  <div className="resume__dropzone-icon"><Upload size={32} /></div>
                  <p className="resume__dropzone-title">Drop your resume here</p>
                  <p className="resume__dropzone-hint">PDF, DOC, DOCX or TXT · Max 5 MB</p>
                </>
              )}
            </div>

            {/* Target Role */}
            <div className="resume__field-wrap">
              <label className="resume__field-label" htmlFor="target-role-input">
                <Target size={14} />
                Target Role <span className="resume__optional">(optional but recommended)</span>
              </label>
              <input id="target-role-input" type="text" className="resume__field-input"
                placeholder="e.g. Senior Product Manager at Google"
                value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              <p className="resume__field-hint">Tailors keyword matching and ATS scoring to your specific role.</p>
            </div>

            {/* Feature list */}
            <Card className="resume__features-card">
              <p className="resume__features-title"><Sparkles size={15} /> What our AI analyzes</p>
              <div className="resume__features-grid">
                {[
                  { icon: Target, label: 'ATS Compatibility', desc: 'Keyword & format scoring' },
                  { icon: TrendingUp, label: '2026 Trend Alignment', desc: 'Industry buzz-word mapping' },
                  { icon: Award, label: 'Impact Quantification', desc: 'Metric-driven bullet audit' },
                  { icon: Zap, label: 'AI Rewrite Engine', desc: 'Section-level rewrites' },
                  { icon: Briefcase, label: 'Role Fit Score', desc: 'Alignment to target JD' },
                  { icon: Clock, label: 'Recruiter Scan Test', desc: 'First-6-second impression' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="resume__feature-item">
                    <Icon size={16} className="resume__feature-icon" />
                    <div>
                      <p className="resume__feature-label">{label}</p>
                      <p className="resume__feature-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Button id="btn-analyze-resume" variant="primary" size="lg" fullWidth
              icon={Sparkles} onClick={handleAnalyze}>
              Analyze My Resume
            </Button>
          </div>
        )}

        {/* ─── ANALYZING PHASE ─── */}
        {phase === 'analyzing' && (
          <div className="resume__analyzing-phase">
            <div className="resume__analyzing-hero">
              <div className="resume__analyzing-pulse"><Sparkles size={40} /></div>
              <h2 className="resume__analyzing-title">Gemini AI is analysing…</h2>
              <p className="resume__analyzing-sub">Scanning {fileName}</p>
            </div>
            <div className="resume__progress-wrap">
              <div className="resume__progress-bar-track">
                <div className="resume__progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="resume__progress-pct">{progress}%</span>
            </div>
            <div className="resume__analyzing-steps">
              {[
                { label: 'Parsing document structure', done: progress >= 15 },
                { label: 'Running ATS keyword scan', done: progress >= 30 },
                { label: 'Scoring section quality', done: progress >= 50 },
                { label: 'Benchmarking against 2026 trends', done: progress >= 65 },
                { label: 'Generating AI rewrites', done: progress >= 78 },
                { label: 'Building corrected resume', done: progress >= 88 },
                { label: 'Compiling full report', done: progress >= 100 },
              ].map(({ label, done }) => (
                <div key={label} className={`resume__step ${done ? 'resume__step--done' : ''}`}>
                  <CheckCircle2 size={15} /><span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RESULTS PHASE ─── */}
        {phase === 'results' && analysis && (
          <div className="resume__results-phase">

            {/* Score Hero */}
            <div className="resume__score-hero">
              <div className="resume__score-ring-wrap">
                <ScoreRing score={score} size={130} />
                <div className="resume__score-center">
                  <span className="resume__score-number">{score}</span>
                  <span className="resume__score-unit">/100</span>
                </div>
              </div>
              <div className="resume__score-meta">
                <p className="resume__score-eyebrow">Overall Resume Score</p>
                <p className="resume__score-grade">{analysis.grade || (score >= 80 ? 'Excellent 🏆' : score >= 65 ? 'Good 📈' : score >= 50 ? 'Fair ⚠️' : 'Needs Work 🔧')}</p>
                <p className="resume__score-file">{fileName}</p>
                {targetRole && (
                  <div className="resume__score-role-chip">
                    <Briefcase size={11} />{targetRole}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="resume__quick-stats">
              {[
                { label: 'ATS Score', value: `${analysis.sections?.find(s => s.id === 'ats')?.score ?? '--'}%`, icon: Target, color: '#ef4444' },
                { label: 'Strengths', value: `${analysis.sections?.filter(s => s.status === 'strong').length ?? 0}`, icon: Star, color: '#22c55e' },
                { label: 'Critical Issues', value: `${analysis.sections?.filter(s => s.status === 'critical').length ?? 0}`, icon: AlertTriangle, color: '#f59e0b' },
                { label: 'AI Rewrites', value: `${analysis.sections?.filter(s => s.rewrite).length ?? 0}`, icon: Zap, color: 'var(--color-primary-container)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="resume__stat-chip">
                  <Icon size={16} style={{ color }} />
                  <p className="resume__stat-val" style={{ color }}>{value}</p>
                  <p className="resume__stat-lbl">{label}</p>
                </Card>
              ))}
            </div>

            {/* Section Analysis */}
            <section className="resume__sections-wrap">
              <h2 className="resume__sections-title">Section-by-Section Analysis</h2>
              <div className="resume__sections-list">
                {analysis.sections?.map(section => (
                  <SectionCard key={section.id} section={section} />
                ))}
              </div>
            </section>

            {/* Trending Keywords */}
            <Card className="resume__keywords-card">
              <p className="resume__keywords-title"><TrendingUp size={15} /> 2026 Corporate Trending Keywords</p>
              <p className="resume__keywords-hint">Add relevant ones to strengthen your resume.</p>
              <div className="resume__keywords-chips">
                {keywords.map(kw => <span key={kw} className="resume__kw-chip">{kw}</span>)}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="resume__result-actions">
              <Button id="btn-download-report" variant="primary" size="lg" fullWidth icon={Download}
                onClick={() => downloadAnalysisReport(analysis, fileName, targetRole)}>
                Download Analysis Report
              </Button>
              {analysis.correctedResume && (
                <>
                  <Button id="btn-download-corrected-pdf" variant="secondary" size="lg" fullWidth icon={FileText}
                    onClick={() => downloadCorrectedResumePDF(analysis, fileName)}>
                    Save Corrected Resume as PDF
                  </Button>
                  <Button id="btn-download-corrected-doc" variant="secondary" size="lg" fullWidth icon={FileText}
                    onClick={() => downloadCorrectedResumeDOC(analysis, fileName)}>
                    Download Corrected Resume as DOC
                  </Button>
                </>
              )}
              <Button id="btn-analyze-again" variant="ghost" size="lg" fullWidth icon={RefreshCw}
                onClick={handleReset}>
                Analyze Another Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
