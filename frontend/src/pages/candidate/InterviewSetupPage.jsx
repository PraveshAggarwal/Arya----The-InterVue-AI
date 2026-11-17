import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { ResumeUploader } from '../../components/resume/ResumeUploader';
import { useToast } from '../../context/ToastContext';
import { interviewService, questionService, resumeService } from '../../services/api';

export const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [resumeId, setResumeId] = useState('');
  const [currentResume, setCurrentResume] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    resumeService.getAll()
      .then(({ data = [] }) => {
        if (data[0]) { setCurrentResume(data[0]); setResumeId(data[0]._id); }
      })
      .catch(() => {});
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobRole.trim() || !jobDescription.trim()) return;
    setLoading(true);
    try {
      const { data: interview } = await interviewService.create({
        resumeId,
        jobRole: jobRole.trim(),
        jobDescription: jobDescription.trim(),
        totalQuestions: 8,
      });
      const { data } = await questionService.generate(interview._id);
      addToast('Interview questions generated!', 'success');
      navigate(`/interview/${interview._id}`, { state: { questions: data.questions } });
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not generate questions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <header className="pb-4 border-b border-[#141d33]">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Create an Interview</h1>
        <p className="text-sm text-slate-400 mt-2">Upload your resume, enter a job title and description to generate tailored questions.</p>
      </header>

      <ResumeUploader
        onFileUpload={handleUpload}
        currentResume={currentResume}
        uploading={uploading}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5 space-y-4">
          <label className="block text-sm font-bold text-white">
            <span className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              Job Title
            </span>
            <input
              required
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full rounded-xl bg-[#090e1b] border border-[#1b2640] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </label>

          <label className="block text-sm font-bold text-white">
            <span className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Job Description
            </span>
            <textarea
              required
              rows={7}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full rounded-xl bg-[#090e1b] border border-[#1b2640] p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </label>
        </Card>

        <button
          type="submit"
          disabled={loading || uploading || !resumeId}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" />Generating questions...</>
            : <><Sparkles className="w-5 h-5" />Create Interview</>
          }
        </button>
      </form>
    </div>
  );
};
