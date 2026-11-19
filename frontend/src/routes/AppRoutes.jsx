import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Bot, Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('../pages/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('../pages/candidate/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InterviewSetupPage = lazy(() => import('../pages/candidate/InterviewSetupPage').then(m => ({ default: m.InterviewSetupPage })));
const InterviewQuestionsPage = lazy(() => import('../pages/interview/InterviewQuestionsPage').then(m => ({ default: m.InterviewQuestionsPage })));
const InterviewHistoryPage = lazy(() => import('../pages/candidate/InterviewHistoryPage').then(m => ({ default: m.InterviewHistoryPage })));
const ResumeAnalysisPage = lazy(() => import('../pages/candidate/ResumeAnalysisPage').then(m => ({ default: m.ResumeAnalysisPage })));
const ProfilePage = lazy(() => import('../pages/candidate/ProfilePage').then(m => ({ default: m.ProfilePage })));

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-xl shadow-sky-500/20 animate-pulse">
      <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center">
        <Bot className="w-6 h-6 text-sky-400" />
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
      <span>Loading InterVue AI...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview/setup" element={<InterviewSetupPage />} />
          <Route path="/history" element={<InterviewHistoryPage />} />
          <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Live interview — fullscreen, no sidebar */}
        <Route path="/interview/:id" element={<ProtectedRoute><InterviewQuestionsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
