import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Loader2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { ResumeUploader } from '../../components/resume/ResumeUploader';
import { useToast } from '../../context/ToastContext';
import { interviewService, questionService, resumeService } from '../../services/api';

export const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [resumeId, setResumeId] = useState('');
  const [currentResume, setCurrentResume] = useState(null);
  const [jobRole, setJobRole] = useState(location.state?.jobRole || '');
  const [experienceYears, setExperienceYears] = useState(
    location.state?.experienceYears != null ? String(location.state.experienceYears) : ''
  );
  const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recommendationTag, setRecommendationTag] = useState(
    location.state?.fromRecommendation ? (location.state.recommendationTitle || location.state.jobRole) : ''
  );

  useEffect(() => {
    resumeService.getAll()
      .then(({ data = [] }) => {
        if (data[0]) {
          setCurrentResume(data[0]);
          setResumeId(data[0]._id);
        }
      })
      .catch(() => {});
  }, []);

  // Sync when navigating with state from recommendations
  useEffect(() => {
    if (location.state) {
      if (location.state.jobRole) setJobRole(location.state.jobRole);
      if (location.state.experienceYears != null) setExperienceYears(String(location.state.experienceYears));
      if (location.state.jobDescription) setJobDescription(location.state.jobDescription);
      if (location.state.fromRecommendation) {
        setRecommendationTag(location.state.recommendationTitle || location.state.jobRole);
        addToast('Auto-filled details from recommendation!', 'info');
      }
    }
  }, [location.state, addToast]);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const result = await resumeService.upload(form);
      const resume = result.data.resume;
      setCurrentResume(resume);
      setResumeId(resume._id);
      addToast('Resume uploaded and parsed.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Resume upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const clearRecommendation = () => {
    setRecommendationTag('');
    setJobRole('');
    setExperienceYears('');
    setJobDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobRole.trim() || experienceYears === '') return;
    setLoading(true);
    try {
      const { data: interview } = await interviewService.create({
        resumeId,
        jobRole: jobRole.trim(),
        experienceYears: Number(experienceYears),
        jobDescription: jobDescription.trim(),
      });
      const { data } = await questionService.generate(interview._id);
      navigate(`/interview/${interview._id}`, { state: { questions: data.questions } });
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not generate questions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <header className="pb-4 border-b border-[#141d33] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Practice for your next role</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Any profession, any career stage. Your role, experience, and job description shape a relevant interview.</p>
        </div>
      </header>

      <ResumeUploader
        onFileUpload={handleUpload}
        currentResume={currentResume}
        uploading={uploading}
        required
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <label className="block text-sm font-bold text-white">
            <span className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Target job title <span className="text-rose-400">*</span>
            </span>
            <input
              required
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. BDE, UI/UX Designer, Sales Executive, Teacher, Software Developer"
              className="w-full rounded-xl bg-[#090e1b] border border-[#1b2640] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </label>

          <label className="block text-sm font-bold text-white">
            <span className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Years of experience <span className="text-rose-400">*</span>
            </span>
            <input
              required
              type="number"
              min="0"
              max="60"
              step="0.5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-xl bg-[#090e1b] border border-[#1b2640] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </label>

          <label className="block text-sm font-bold text-white">
            <span className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Job Description <span className="text-xs font-normal text-slate-500">(optional)</span>
            </span>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full rounded-xl bg-[#090e1b] border border-[#1b2640] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </label>
        </Card>

        <button
          type="submit"
          disabled={loading || uploading || !resumeId || !jobRole.trim() || experienceYears === ''}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating custom interview plan...</span></>
            : <><Sparkles className="w-5 h-5" /><span>Create Interview</span></>
          }
        </button>
      </form>
    </div>
  );
};
