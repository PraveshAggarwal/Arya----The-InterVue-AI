import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BadgeCheck, Clock3, Download, FileSearch, Lightbulb, Loader2, Sparkles, Target } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { ResumeUploader } from '../../components/resume/ResumeUploader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useToast } from '../../context/ToastContext';
import { resumeService } from '../../services/api';

const SectionScore = ({ label, score }) => (
  <div className="rounded-xl border border-[#1b2640] bg-[#080d18] p-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <span className="text-xs text-slate-300">{label}</span>
      <span className="text-xs font-bold text-sky-300">{score}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-[#17213a] overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400" style={{ width: `${score}%` }} />
    </div>
  </div>
);

const FeedbackList = ({ title, items, icon: Icon, tone }) => (
  <Card className="p-5 sm:p-6">
    <h2 className={`flex items-center gap-2 text-sm font-bold ${tone} mb-4`}>
      <Icon className="w-4 h-4" />
      {title}
    </h2>
    {items?.length ? (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ) : <p className="text-xs text-slate-500">No items were returned for this section.</p>}
  </Card>
);

const KeywordCard = ({ title, items = [], tone, emptyMessage }) => (
  <Card className="keyword-card p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className={`keyword-title text-sm font-bold ${tone}`}>{title}</h2>
      <span className="keyword-count text-[10px] text-slate-500">{items.length} found</span>
    </div>
    {items.length ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className={`keyword-text px-2.5 py-1 rounded-full border text-[10px] ${tone} border-current/20 bg-current/5`}>{item}</span>)}
      </div>
    ) : <p className="text-xs text-slate-500">{emptyMessage}</p>}
  </Card>
);

export const ResumeAnalysisPage = () => {
  const { addToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzedAt, setAnalyzedAt] = useState(null);

  const selectedResume = useMemo(() => resumes.find((resume) => resume._id === selectedId) || null, [resumes, selectedId]);

  useEffect(() => {
    resumeService.getAll()
      .then(({ data = [] }) => {
        setResumes(data);
        if (data[0]) setSelectedId(data[0]._id);
      })
      .catch(() => addToast('Could not load your saved resumes.', 'error'));
  }, [addToast]);

  useEffect(() => {
    setAnalysis(selectedResume?.analysis || null);
    setAnalyzedAt(selectedResume?.analyzedAt || null);
    setTargetRole(selectedResume?.analysisTargetRole || '');
  }, [selectedResume]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const { data } = await resumeService.upload(form);
      const resume = data.resume;
      setResumes((current) => [resume, ...current.filter((item) => item._id !== resume._id)]);
      setSelectedId(resume._id);
      setAnalysis(null);
      setAnalyzedAt(null);
      addToast('Resume uploaded and parsed.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Resume upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!selectedResume) return;
    setAnalyzing(true);
    try {
      const { data } = await resumeService.analyze(selectedResume._id, { targetRole, jobDescription });
      setAnalysis(data.analysis);
      setAnalyzedAt(data.analyzedAt);
      setResumes((current) => current.map((resume) => resume._id === selectedResume._id
        ? { ...resume, analysis: data.analysis, analysisTargetRole: data.analysisTargetRole, analyzedAt: data.analyzedAt }
        : resume));
      addToast('Resume analysis completed.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Resume analysis failed. Please try again.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const sectionScores = analysis?.sectionScores || {};
  const analysisDate = analyzedAt ? new Date(analyzedAt).toLocaleString() : '';
  const matchedKeywords = analysis?.matchedKeywords || [];
  const missingKeywords = analysis?.missingKeywords || [];
  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const keywordCoverage = totalKeywords ? Math.round((matchedKeywords.length / totalKeywords) * 100) : null;
  const scoreLabel = analysis?.atsScore >= 85
    ? 'Strong ATS readiness'
    : analysis?.atsScore >= 70
      ? 'Good foundation'
      : analysis?.atsScore >= 50
        ? 'Some gaps to address'
        : 'Needs focused improvements';

  const downloadReport = () => {
    if (!analysis) return;
    const reportText = [
      'RESUME ANALYSIS REPORT',
      `Resume: ${selectedResume?.originalName || 'Selected resume'}`,
      `Target role: ${targetRole || 'General ATS readiness'}`,
      `ATS readiness score: ${analysis.atsScore}/100`,
      `Summary: ${analysis.summary || ''}`,
      '',
      'STRENGTHS', ...(analysis.strengths || []).map((item) => `- ${item}`),
      '',
      'WEAKNESSES', ...(analysis.weaknesses || []).map((item) => `- ${item}`),
      '',
      'AREAS TO IMPROVE', ...(analysis.improvements || []).map((item, index) => `${index + 1}. ${item}`),
      '',
      'MATCHED KEYWORDS', ...(matchedKeywords.length ? matchedKeywords.map((item) => `- ${item}`) : ['- None returned']),
      '',
      'KEYWORDS TO CONSIDER', ...(missingKeywords.length ? missingKeywords.map((item) => `- ${item}`) : ['- None returned']),
      '',
      'ATS score is an AI estimate based on common resume practices, not a guarantee of employer screening results.',
    ].join('\n');
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = (selectedResume?.originalName || 'resume').replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-');
    link.href = downloadUrl;
    link.download = `${filename}-analysis.txt`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <header className="pb-4 border-b border-[#141d33]">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-blue-600/15 text-sky-400 border border-blue-500/30">
          <Sparkles className="w-3 h-3" /> Resume Analysis
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">Check your resume’s ATS readiness</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">Get an estimated ATS score, role-specific keyword coverage, strengths, gaps, and practical improvements based on your resume.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <ResumeUploader onFileUpload={handleUpload} currentResume={selectedResume} uploading={uploading} />

          <Card className="p-5 sm:p-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2"><FileSearch className="w-4 h-4 text-sky-400" /> Analysis settings</h2>
              {resumes.length > 0 && (
                <label className="block text-xs font-medium text-slate-300">
                  Resume to analyze
                  <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1.5 w-full rounded-xl bg-[#080c16] border border-[#1b2640] p-3 text-xs text-white focus:outline-none focus:border-sky-400">
                    {resumes.map((resume) => <option key={resume._id} value={resume._id}>{resume.originalName}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-xs font-medium text-slate-300">
                Target role <span className="text-slate-500 font-normal">(optional)</span>
                <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} maxLength={120} placeholder="e.g. Data Analyst" className="mt-1.5 w-full rounded-xl bg-[#080c16] border border-[#1b2640] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400" />
              </label>
              <label className="block text-xs font-medium text-slate-300">
                Job description <span className="text-slate-500 font-normal">(optional, improves keyword matching)</span>
                <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} maxLength={10000} rows={5} placeholder="Paste the job description to compare your resume with the role..." className="mt-1.5 w-full rounded-xl bg-[#080c16] border border-[#1b2640] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 resize-y" />
              </label>
              <button type="submit" disabled={!selectedResume || analyzing || uploading} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 py-3 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing resume...</> : <><Sparkles className="w-4 h-4" />{analysis ? 'Refresh Analysis' : 'Analyze Resume'}</>}
              </button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-5">
          {!analysis ? (
            <Card className="min-h-[360px] p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4"><Target className="w-7 h-7" /></div>
              <h2 className="text-base font-bold text-white">Your analysis will appear here</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">Upload a PDF or DOCX resume, optionally add a target role or job description, then run the analysis.</p>
            </Card>
          ) : (
            <>
              <Card className="p-5 sm:p-6 border-sky-500/25">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <ScoreRing score={analysis.atsScore} size={126} strokeWidth={11} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-lg font-bold text-white">ATS Readiness Score</h2>
                      <span className="px-2 py-0.5 rounded-full border border-sky-500/25 bg-sky-500/10 text-[10px] font-semibold text-sky-300">{scoreLabel}</span>
                    </div>
                    {analysisDate && <p className="inline-flex items-center gap-1 text-[10px] text-slate-500 mb-2"><Clock3 className="w-3 h-3" />Analyzed {analysisDate}</p>}
                    <p className="text-xs leading-relaxed text-slate-300">{analysis.summary}</p>
                    <p className="text-[10px] text-slate-500 mt-3">AI estimate based on common ATS practices; actual results vary by employer and screening software.</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#1b2640] bg-[#080d18] p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-200">Keyword coverage</span>
                      <span className="text-sky-300">{keywordCoverage == null ? 'No keyword data' : `${keywordCoverage}% · ${matchedKeywords.length} matched`}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#17213a] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" style={{ width: `${keywordCoverage ?? 0}%` }} />
                    </div>
                  </div>
                  <button type="button" onClick={downloadReport} className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/25 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/10">
                    <Download className="w-3.5 h-3.5" />Download report
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  <SectionScore label="Role alignment" score={sectionScores.roleFit ?? 0} />
                  <SectionScore label="Skills coverage" score={sectionScores.skills ?? 0} />
                  <SectionScore label="Experience detail" score={sectionScores.experience ?? 0} />
                  <SectionScore label="Measurable impact" score={sectionScores.impact ?? 0} />
                  <SectionScore label="Structure & readability" score={sectionScores.structure ?? 0} />
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FeedbackList title="Strong points" items={analysis.strengths} icon={BadgeCheck} tone="text-emerald-400" />
                <FeedbackList title="Weak points" items={analysis.weaknesses} icon={AlertTriangle} tone="text-amber-400" />
              </div>

              <Card className="p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-4"><Lightbulb className="w-4 h-4" />Priority improvements</h2>
                <ol className="space-y-3">
                  {(analysis.improvements || []).map((item, index) => (
                    <li key={`${index}-${item}`} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                      <span className="w-6 h-6 shrink-0 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-bold text-sky-300">{index + 1}</span>
                      <span className="pt-1">{item}</span>
                    </li>
                  ))}
                </ol>
                {!analysis.improvements?.length && <p className="text-xs text-slate-500">No improvement steps were returned.</p>}
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <KeywordCard title="Matched keywords" items={matchedKeywords} tone="text-emerald-300" emptyMessage="No matched keywords were returned." />
                <KeywordCard title="Keywords to consider" items={missingKeywords} tone="text-violet-300" emptyMessage="No missing keywords were returned." />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
