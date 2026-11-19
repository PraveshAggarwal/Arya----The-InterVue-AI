import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  FileText,
  Sparkles,
  Mic,
  Video,
  Award,
  CheckCircle2,
  ChevronDown,
  Brain,
  Code2,
  Terminal,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, XIcon } from '../../components/common/SocialIcons';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import aryaPortrait from '../../assets/arya-interviewer.png';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Interactive states
  const [activeStep, setActiveStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewWaveActive, setPreviewWaveActive] = useState(true);

  const workflowSteps = [
    {
      step: '01',
      title: 'Target Role & Resume Context',
      summary: 'Upload your PDF/DOCX resume and paste the exact target job description.',
      detail:
        'InterVue parses your background—identifying key technical stacks, leadership scope, and project achievements—and cross-references it with the job requirements to formulate a realistic interview scope.',
      tag: 'Resume Intelligence',
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Dynamic Question Generation',
      summary: 'Gemini LLM synthesizes tailored technical, architectural, and behavioral questions.',
      detail:
        'Instead of canned trivia from a spreadsheet, our engine designs multi-tiered questions tailored to your declared years of experience, testing depth, design patterns, and edge cases.',
      tag: 'LLM Orchestration',
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Live Conversational Voice Interview',
      summary: 'Engage with Arya in a live two-way voice call with real-time speech recognition.',
      detail:
        'Arya speaks with natural pacing, listens via continuous browser speech-to-text, and dynamically challenges your answers with follow-ups ("Could you elaborate on how you handled cache invalidation?").',
      tag: 'Real-time Voice & Video',
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Comprehensive Performance Audit',
      summary: 'Instant detailed scorecard evaluating communication, depth, and structured thinking.',
      detail:
        'Receive itemized scoring across 4 core competency dimensions, complete question-by-question response logs, and constructive actionable guidance to boost your confidence before real interviews.',
      tag: 'Actionable Analytics',
      badge: 'Step 4'
    }
  ];

  const features = [
    {
      category: 'voice',
      icon: Mic,
      title: 'Natural Conversational Speech',
      description:
        'Built with native Web Speech synthesis and recognition. Speak naturally as you would in an actual on-site or Zoom interview with instant visual audio feedback.',
      highlight: 'Sub-second latency'
    },
    {
      category: 'ai',
      icon: Brain,
      title: 'Context-Aware Adaptive Follow-ups',
      description:
        'Arya doesn’t just read a list—she listens to your actual answer and probes deeper, asking for concrete architecture choices, metric results, and alternatives.',
      highlight: 'Multi-turn reasoning'
    },
    {
      category: 'resume',
      icon: FileText,
      title: 'Deep Resume & JD Parsing',
      description:
        'Directly upload your PDF or DOCX resume. The platform maps your previous company roles and projects directly to the competencies expected by the employer.',
      highlight: 'PDF & DOCX support'
    },
    {
      category: 'video',
      icon: Video,
      title: 'Camera & Posture Environment',
      description:
        'Mirror your real interview setup. Video preview lets you practice eye contact, posture, and facial confidence in a safe, zero-judgment sandbox.',
      highlight: 'Client-side WebRTC'
    },
    {
      category: 'analytics',
      icon: Award,
      title: 'Rubric-Based Scorecard',
      description:
        'Detailed breakdown across Communication, Technical Depth, Problem Solving, and Executive Presence, plus specific critique for every single response.',
      highlight: 'Detailed breakdown'
    },
    {
      category: 'privacy',
      icon: ShieldCheck,
      title: 'Privacy-First Architecture',
      description:
        'Your voice streams and webcam feeds stay local in your browser sandbox. Only extracted interview text prompts interact with secure model endpoints.',
      highlight: '100% Private'
    }
  ];

  const faqs = [
    {
      q: 'How does InterVue AI tailor questions specifically to my profile?',
      a: 'When you upload your resume and input the target job title, InterVue extracts your core tech competencies, project scopes, and seniority level. Our backend prompts Google Gemini to compare your experience against the role expectations, crafting targeted technical questions and realistic behavioral scenarios rather than generic trivia.'
    },
    {
      q: 'Do I need a webcam and microphone to use the platform?',
      a: 'Yes. An interview is inherently conversational. We use your microphone for speech-to-text recognition so Arya can hear you, and your webcam to simulate the physical reality of a modern remote interview. Both stream securely in your local browser sandbox.'
    },
    {
      q: 'What happens if I stop speaking or take time to think?',
      a: 'Arya is designed like a patient, professional human interviewer. You can take your time to gather your thoughts. If you stay silent for 15 seconds, Arya will gently prompt you or offer to repeat the question. When you are finished answering, you can either pause for 10 seconds or click "Done Speaking" to proceed immediately.'
    },
    {
      q: 'Does Arya ask dynamic follow-up questions?',
      a: 'Yes! Unlike static question banks, Arya evaluates your answer after each turn. If your response lacks specific trade-offs or technical depth, she will dynamically ask a follow-up question (e.g. "Can you provide a specific production example where that database index helped?").'
    },
    {
      q: 'Can I practice for non-technical roles?',
      a: 'Absolutely. While popular with software engineers, DevOps, and cloud architects, InterVue AI works equally well for Product Managers, Data Analysts, Sales Engineers, and Designers. Simply paste the role title and description during setup.'
    },
    {
      q: 'Can I review my past interview transcripts and performance ratings?',
      a: 'Yes. Every completed mock interview is automatically stored in your Candidate Dashboard under "Interview History." You can review the exact transcript, Arya’s remarks, score metrics, and targeted improvement suggestions anytime.'
    }
  ];

  const filteredFeatures =
    activeCategory === 'all'
      ? features
      : features.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative px-4 pt-16 sm:pt-24 pb-20 text-center overflow-hidden border-b border-[#111827]">
          {/* Subtle ambient lighting */}
          <div className="absolute inset-x-0 -top-20 mx-auto w-[650px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute right-10 top-1/3 w-[300px] h-[250px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto">
            {/* Developer Attribution Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1527] border border-sky-500/25 text-xs text-sky-300 mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Architected & Built by <strong className="text-white font-semibold">Pravesh Aggarwal</strong></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              The mock interview platform that{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                actually listens
              </span>{' '}
              and challenges you.
            </h1>

            {/* Subheading */}
            <p className="max-w-3xl mx-auto mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Pair your resume with any job description. Arya, your AI interviewer, conducts a realistic multi-turn voice session with contextual follow-ups, grading your answers across real industry rubrics.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => navigate(isAuthenticated ? '/interview/setup' : '/register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 border border-blue-400/30 flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Start Mock Interview' : 'Practice For Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#0f172a] hover:bg-[#162038] text-slate-200 border border-[#233152] hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust & Engineering Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-[#0c1220]/70 border border-[#16223b]">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Real-Time Voice</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Native Web Speech synthesis & continuous transcription</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220]/70 border border-[#16223b]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Brain className="w-4 h-4" />
                  <span>Adaptive Logic</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Contextual follow-ups based on the depth of your answers</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220]/70 border border-[#16223b]">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Resume Grounding</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Extracts authentic skills and cross-checks with job specs</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1220]/70 border border-[#16223b]">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Private Sandbox</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Client-side media streams with confidential transcripts</p>
              </div>
            </div>

            {/* ===================== LIVE INTERFACE PREVIEW ===================== */}
            <div className="mt-14 max-w-4xl mx-auto text-left">
              <div className="rounded-2xl border border-[#1d2b49] bg-[#090e1c] shadow-2xl overflow-hidden">
                {/* Window Chrome */}
                <div className="h-10 px-4 bg-[#0d1424] border-b border-[#17223b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] text-slate-400 font-mono">intervue-live-studio // Senior Backend Engineer Session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Audio
                    </span>
                  </div>
                </div>

                {/* Studio Mockup Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Left: AI Avatar Tile */}
                  <div className="md:col-span-1 rounded-xl bg-[#0e1628] border border-[#1b2742] p-4 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                        <img src={aryaPortrait} alt="Arya AI Interviewer" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-blue-600 text-[9px] font-bold text-white uppercase tracking-wider">
                        AI
                      </div>
                    </div>
                    <h4 className="text-white text-xs font-bold">Arya</h4>
                    <p className="text-[10px] text-sky-400 mt-0.5 font-medium">Senior Interview Lead</p>

                    {/* Sound indicator */}
                    <div className="flex items-center gap-1 mt-3 h-4">
                      {[0.3, 0.7, 1, 0.6, 0.4, 0.8, 0.3].map((val, idx) => (
                        <div
                          key={idx}
                          className="w-1 bg-sky-400 rounded-full animate-waveform"
                          style={{ height: `${val * 16}px`, animationDelay: `${idx * 0.12}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Speaking question...</span>
                  </div>

                  {/* Right: Question and Candidate Response Mockup */}
                  <div className="md:col-span-2 flex flex-col justify-between space-y-3">
                    <div className="p-4 rounded-xl bg-[#0c1220] border border-sky-500/25">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Question 3 of 6 · System Architecture</span>
                        <span className="text-[10px] font-mono text-slate-400">Duration: 02:45</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                        "Your resume highlights designing high-throughput payment pipelines. How did you maintain idempotency and avoid duplicate ledger writes during network partitions?"
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#090d18] border border-[#1a253d]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Mic className="w-3 h-3 text-emerald-400" />
                          Candidate Voice Transcript
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">Streaming Live</span>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "We implemented distributed idempotency keys in Redis backed by database unique constraints, pairing that with an outbox pattern for transactional Kafka events..."
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Arya will evaluate technical depth and clarity upon completion.
                      </span>
                      <button
                        onClick={() => navigate(isAuthenticated ? '/interview/setup' : '/register')}
                        className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
                      >
                        Try it live <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FEATURES SECTION ===================== */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#111827]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/25 text-xs text-blue-400 font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Engineered For Depth
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Every tool you need to ace real-world technical loops.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              Designed from the ground up by engineers who have sat on both sides of the hiring table. No generic robotic multiple-choice questions—only realistic conversational scenarios.
            </p>

            {/* Filter buttons */}
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              {[
                { id: 'all', label: 'All Capabilities' },
                { id: 'voice', label: 'Voice & Speech' },
                { id: 'ai', label: 'Adaptive Intelligence' },
                { id: 'resume', label: 'Resume Grounding' },
                { id: 'analytics', label: 'Scoring & Rubrics' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#0f172a] text-slate-400 hover:text-white hover:bg-[#152038]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card
                  key={feat.title}
                  className="p-6 flex flex-col justify-between hover:border-sky-500/40 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#11192e] border border-sky-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-sky-400" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#131c33] text-sky-400 border border-sky-500/20">
                        {feat.highlight}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#141d33] flex items-center text-[11px] text-slate-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                    Production-tested implementation
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ===================== HOW IT WORKS SECTION ===================== */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#111827]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-semibold mb-3">
              <Code2 className="w-3.5 h-3.5" />
              Human Developer Methodology
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How InterVue AI replicates an authentic engineering loop.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              From uploading your credentials to actionable feedback in four seamless stages.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Selector Column */}
            <div className="lg:col-span-5 space-y-3">
              {workflowSteps.map((s, index) => (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(index)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeStep === index
                      ? 'bg-[#0f172a] border-sky-500/50 shadow-lg shadow-sky-500/5'
                      : 'bg-[#090d18] border-[#162138] hover:border-slate-700 hover:bg-[#0c1322]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold font-mono text-sky-400 tracking-wider">
                      PHASE {s.step}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      activeStep === index ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {s.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.summary}</p>
                </div>
              ))}
            </div>

            {/* Interactive Preview Display */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#1b2742] bg-[#0c1222] p-7 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#18233b] mb-6">
                  <div>
                    <span className="text-xs font-mono text-sky-400 uppercase font-bold">
                      {workflowSteps[activeStep].badge} In Depth
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {workflowSteps[activeStep].title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
                    {workflowSteps[activeStep].step}
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {workflowSteps[activeStep].detail}
                </p>

                {/* Conceptual Workflow Graphic */}
                <div className="rounded-xl bg-[#080c16] border border-[#162138] p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                    <span>EXECUTION FLOW: PHASE {workflowSteps[activeStep].step}</span>
                    <span className="text-emerald-400">● LIVE RUNTIME</span>
                  </div>

                  {activeStep === 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span className="text-slate-200">resume_engineer.pdf uploaded & vectorized</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640] flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-200">Target Role: Senior Full Stack Engineer (5+ YOE)</span>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640] text-slate-300">
                        &gt; Synthesizing 6 custom interview prompts...<br />
                        &gt; Balancing: 40% System Design, 40% Coding & Concurrency, 20% Behavioral Leadership.
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0e1628] border border-sky-500/30 flex items-center justify-between">
                        <span className="text-sky-300">Arya Voice Stream Active (Continuous Speech-to-Text)</span>
                        <Mic className="w-4 h-4 text-sky-400 animate-pulse" />
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640] text-slate-400 italic">
                        "Arya: Can you walk me through the hardest debugging issue you resolved in your recent project?"
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640]">
                          <span className="text-slate-400 block text-[10px]">Technical Depth</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">92 / 100</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0e1628] border border-[#1a2640]">
                          <span className="text-slate-400 block text-[10px]">Clarity & Structure</span>
                          <span className="text-sm font-bold text-sky-400 font-mono">88 / 100</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Step {activeStep + 1} of {workflowSteps.length}
                  </span>
                  <button
                    onClick={() => navigate(isAuthenticated ? '/interview/setup' : '/register')}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <span>Try This Flow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FAQ SECTION ===================== */}
        <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-b border-[#111827]">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs text-violet-400 font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Got questions? We've got transparent answers.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to know about the platform, voice handling, and our evaluation rubrics.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#0f172a] border-sky-500/40 shadow-md'
                      : 'bg-[#090d18] border-[#162138] hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#162138] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================== DEVELOPER PROFILE SECTION ===================== */}
        <section id="developer" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-[#111827]">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0d1527] via-[#090e1a] to-[#070b14] border border-sky-500/20 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Dev Avatar / Initial Badge */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/25 shrink-0">
                <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white tracking-wider">PA</span>
                  <span className="text-[9px] uppercase font-bold text-sky-400 tracking-widest mt-0.5">DEV</span>
                </div>
              </div>

              {/* Dev Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sole Developer & Architect
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Pravesh Aggarwal</h3>
                  <p className="text-xs sm:text-sm text-sky-400 font-medium">Full Stack Software & AI Engineer</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  "I engineered InterVue AI to bridge the painful gap between theoretical interview prep and high-stakes real-world technical loops. Rather than robotic static flashcards, this platform combines real-time speech recognition, LLM reasoning, and resume parsing to simulate an authentic conversation with an experienced engineering lead."
                </p>

                {/* Social Connect Links Requested by User */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <a
                    href="https://github.com/PraveshAggarwal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11192e] hover:bg-[#18233d] text-slate-200 hover:text-white border border-[#1f2b48] hover:border-sky-500/40 text-xs font-semibold transition-all shadow-sm"
                  >
                    <GithubIcon className="w-4 h-4 text-white" />
                    <span>GitHub: PraveshAggarwal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/praveshaggarwal10/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11192e] hover:bg-[#18233d] text-slate-200 hover:text-white border border-[#1f2b48] hover:border-sky-500/40 text-xs font-semibold transition-all shadow-sm"
                  >
                    <LinkedinIcon className="w-4 h-4 text-sky-400" />
                    <span>LinkedIn: praveshaggarwal10</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href="https://x.com/ImPraveshAgg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11192e] hover:bg-[#18233d] text-slate-200 hover:text-white border border-[#1f2b48] hover:border-sky-500/40 text-xs font-semibold transition-all shadow-sm"
                  >
                    <XIcon className="w-3.5 h-3.5 text-slate-200" />
                    <span>X: @ImPraveshAgg</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FINAL CALL TO ACTION ===================== */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to elevate your interview confidence?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Upload your resume, choose your dream role, and get personalized interview feedback in minutes.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate(isAuthenticated ? '/interview/setup' : '/register')}
                className="px-8 py-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 inline-flex items-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
