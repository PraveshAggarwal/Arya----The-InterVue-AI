import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Sparkles, MessageCircle, ChartNoAxesCombined, Palette, Code2, Users, Megaphone, HeartHandshake, ClipboardCheck, ExternalLink } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

const roles = [
  { icon: BriefcaseBusiness, title: 'Business development', examples: 'BDE, Partnerships, Account Executive' },
  { icon: Palette, title: 'Product & design', examples: 'UI/UX, Product Manager, Researcher' },
  { icon: Code2, title: 'Technology & data', examples: 'Developer, Analyst, IT support' },
  { icon: Megaphone, title: 'Sales & marketing', examples: 'Sales Executive, Content, Growth' },
  { icon: HeartHandshake, title: 'People & customer teams', examples: 'HR, Customer Success, Service' },
  { icon: ClipboardCheck, title: 'Operations & beyond', examples: 'Finance, Education, Operations' },
];

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const start = () => navigate(isAuthenticated ? '/dashboard' : '/register');

  useEffect(() => {
    const scrollToId = location.state?.scrollTo || (location.hash ? location.hash.replace('#', '') : null);
    if (scrollToId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollToId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="landing-theme min-h-screen bg-[#f7f6f2] text-[#17251f] flex flex-col selection:bg-emerald-200 selection:text-[#17251f]">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="absolute -right-24 -top-28 w-[32rem] h-[32rem] rounded-full bg-[#dcebe0] blur-3xl opacity-70 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4e1d7] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#347354] shadow-sm"><Sparkles className="w-4 h-4" /> Interview practice for every career</div>
              <h1 className="mt-6 max-w-3xl text-4xl sm:text-6xl xl:text-7xl font-semibold leading-[1.04] tracking-[-0.045em] text-[#18382b]">Your next role deserves a better rehearsal.</h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#66756d]">Practice a real conversation shaped around your job, your experience, and your story. From sales and design to engineering, education, operations, and everything in between.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={start} className="theme-preserve-white inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer">Start Practice <ArrowRight className="w-4 h-4 text-white" /></button>
                <a href="#roles" onClick={(e) => { e.preventDefault(); const el = document.getElementById('roles'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hero-secondary-btn inline-flex items-center justify-center rounded-xl border border-[#d7dfd8] bg-white px-6 py-3.5 text-sm font-semibold text-[#345244] hover:bg-[#f1f5f1] transition-colors cursor-pointer">Explore job families</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#77857d]"><span>Role-aware questions</span><span>|</span><span>Voice practice</span><span>|</span><span>Feedback you can use</span></div>
            </div>
            <div className="lg:col-span-5">
              <div className="hero-card rounded-[2rem] bg-[#214c39] p-5 sm:p-7 text-white shadow-2xl shadow-[#173b2b]/20 rotate-1">
                <div className="flex items-start justify-between">
                  <div><div className="text-xs uppercase tracking-[0.18em] text-[#b7d5bf]">Practice session</div><div className="mt-2 text-xl font-semibold">Sales Executive</div></div>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-[#d7eadb]">Your role, your pace</span>
                </div>
                <div className="mt-8 rounded-2xl border border-white/10 bg-[#183b2c] p-5">
                  <div className="flex items-center gap-2 text-xs text-[#b7d5bf]"><MessageCircle className="w-4 h-4" /> Your interviewer asks</div>
                  <p className="mt-3 text-lg sm:text-xl leading-snug font-medium">“Tell me about a time you turned a hesitant prospect into a customer.”</p>
                  <div className="mt-6 flex items-center gap-1.5 h-9" aria-label="Voice interview waveform">{[12,20,28,16,32,22,12,26,34,18,28,14,22,32,16,24,12,30,19,26,14,22,34,17,26,12].map((height, i) => <span key={i} className="w-1 rounded-full bg-[#a9d4b2] opacity-80" style={{ height }} />)}</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/8 p-4"><div className="text-xs text-[#b7d5bf]">Practice focus</div><div className="mt-1 text-sm font-medium">Listening & discovery</div></div>
                  <div className="rounded-xl bg-white/8 p-4"><div className="text-xs text-[#b7d5bf]">After the session</div><div className="mt-1 text-sm font-medium">Clear next steps</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="roles" className="roles-section px-5 py-16 sm:py-24 bg-white border-y border-[#e8ebe6]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl"><div className="roles-badge text-xs font-bold uppercase tracking-[0.17em] text-[#438062]">Made for the work you do</div><h2 className="roles-title mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#18382b]">One practice space. Every kind of interview.</h2><p className="roles-desc mt-4 text-sm sm:text-base leading-relaxed text-[#6c7971]">Start with any job title. Questions and feedback adapt to the role’s real skills, day-to-day situations, and what success looks like.</p></div>
            <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(({ icon: Icon, title, examples }) => <Card key={title} className="role-card rounded-2xl p-5"><div className="role-card-icon w-10 h-10 rounded-xl flex items-center justify-center"><Icon className="w-5 h-5" /></div><h3 className="role-card-title mt-4 font-semibold">{title}</h3><p className="role-card-desc mt-1.5 text-xs leading-relaxed">{examples}</p></Card>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works-section px-5 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-12 sm:mb-16">
              <div className="hiw-badge text-xs font-bold uppercase tracking-[0.17em] text-[#438062]">How It Works</div>
              <h2 className="hiw-header mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-[#18382b]">A natural conversation. Real feedback.</h2>
              <p className="hiw-header-desc mt-4 text-sm sm:text-base leading-relaxed text-[#6c7971]">From setting up your role to receiving AI-powered insights, rehearsal feels like an authentic conversation.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[{ icon: BriefcaseBusiness, title: 'Bring your context', text: 'Add your job title, experience, resume, or job description. Start with as much or as little as you have.' }, { icon: MessageCircle, title: 'Have a real conversation', text: 'Answer naturally by voice or text. Get thoughtful follow-up questions based on what you share.' }, { icon: ChartNoAxesCombined, title: 'Know what to work on', text: 'Get practical feedback on role skills, communication, examples, and how to make your next answer stronger.' }].map(({ icon: Icon, title, text }, i) => <div key={title} className="relative"><div className="hiw-step text-xs font-bold text-[#81a88e]">0{i + 1}</div><Icon className="hiw-icon mt-4 w-6 h-6 text-[#438062]" /><h3 className="hiw-title mt-4 text-lg font-semibold text-[#234331]">{title}</h3><p className="hiw-desc mt-2 text-sm leading-relaxed text-[#718078]">{text}</p></div>)}
            </div>
          </div>
        </section>

        <section id="developer" className="developer-section px-5 pb-16 sm:pb-24">
          <div className="dev-card max-w-7xl mx-auto rounded-[2rem] border border-[#dfe8df] bg-white p-7 sm:p-12">
            <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-start">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-[#1f6447] text-white flex items-center justify-center text-lg font-bold">PA</div>
                <h2 className="dev-name mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-[#487b67]">Pravesh Aggarwal</h2>
                <p className="dev-role mt-2 text-sm font-medium text-[#438062]">Full Stack Software &amp; AI Engineer</p>
              </div>
              <div className="md:pt-2">
                <div className="dev-badge text-xs font-bold uppercase tracking-[0.17em] text-[#438062]">About the developer</div>
                <blockquote className="dev-quote mt-4 text-base sm:text-lg leading-relaxed text-[#526159]">“I engineered InterVue AI to bridge the painful gap between theoretical interview prep and high-stakes real-world technical loops. Rather than robotic static flashcards, this platform combines real-time speech recognition, LLM reasoning, and resume parsing to simulate an authentic conversation with an experienced engineering lead.”</blockquote>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    ['GitHub', 'https://github.com/PraveshAggarwal'],
                    ['LinkedIn', 'https://www.linkedin.com/in/praveshaggarwal10/'],
                    ['X', 'https://x.com/ImPraveshAgg'],
                  ].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="dev-link inline-flex items-center gap-1.5 rounded-lg border border-[#d7dfd8] px-3 py-2 text-xs font-semibold text-[#347354] hover:bg-[#edf4ed]">{label}<ExternalLink className="w-3 h-3" /></a>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section px-5 pb-20"><div className="cta-box max-w-7xl mx-auto rounded-[2rem] bg-[#e8f0e8] px-6 py-12 sm:px-12 sm:py-16 text-center"><div className="cta-icon mx-auto w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#347354]"><Users className="w-6 h-6" /></div><h2 className="cta-title mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-[#18382b]">Whatever your next step, get ready for it.</h2><p className="cta-desc mt-3 mx-auto max-w-xl text-sm sm:text-base text-[#69776e]">Choose a role, tell us what matters, and get a practice session built around you.</p><button onClick={start} className="theme-preserve-white mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-colors cursor-pointer">Start Practice <ArrowRight className="w-4 h-4 text-white" /></button></div></section>
      </main>
      <Footer />
    </div>
  );
};
