import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, FileText, Sparkles } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const features = [
    { title: 'Add your resume', description: 'Upload a PDF or DOCX and we will extract its readable text.', icon: FileText },
    { title: 'Enter the job details', description: 'Provide the job title and paste the job description manually.', icon: Briefcase },
    { title: 'Generate interview questions', description: 'Get questions tailored to the role requirements and your experience.', icon: Sparkles },
  ];

  return <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col"><Navbar />
    <main className="flex-1"><section className="relative px-4 pt-24 pb-20 text-center overflow-hidden"><div className="absolute inset-x-0 top-0 mx-auto w-[700px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" /><div className="relative max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0e1628] border border-sky-500/30 text-xs text-sky-300"><Sparkles className="w-4 h-4" />Interview questions personalized to your resume and job</div>
      <h1 className="mt-8 text-4xl sm:text-6xl font-black text-white tracking-tight">Prepare for your next interview</h1>
      <p className="max-w-2xl mx-auto mt-6 text-base text-slate-400">Enter a job title and description, upload your resume, and generate a tailored set of interview questions.</p>
      <button onClick={() => navigate(isAuthenticated ? '/interview/setup' : '/register')} className="mt-9 px-8 py-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl inline-flex items-center gap-2">Create an interview<ArrowRight className="w-4 h-4" /></button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 text-left">{features.map(({ title, description, icon: Icon }) => <Card key={title} className="p-6"><Icon className="w-6 h-6 text-sky-400 mb-4" /><h2 className="text-base font-bold text-white">{title}</h2><p className="mt-2 text-sm text-slate-400">{description}</p></Card>)}</div>
    </div></section></main><Footer /></div>;
};
