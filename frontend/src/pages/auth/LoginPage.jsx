import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Bot } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please provide a valid email format.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      addToast('Signed in successfully! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) { addToast('Please enter your email address.', 'error'); return; }
    setForgotSubmitted(true);
    addToast('Password reset link sent successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">InterVue AI</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="p-7 sm:p-8 border-sky-500/30 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={Mail}
              error={errors.email}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded bg-[#0c1220] border-[#1d2947] text-blue-600 focus:ring-0 w-3.5 h-3.5" />
                <span>Remember me</span>
              </label>
              <button type="button" onClick={() => setShowForgotModal(true)} className="text-sky-400 hover:text-sky-300 font-medium hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
              Sign In to Platform
            </Button>
          </form>
        </Card>
      </div>

      <Modal
        isOpen={showForgotModal}
        onClose={() => { setShowForgotModal(false); setForgotSubmitted(false); }}
        title="Password Recovery"
        description="Enter your registered email address to receive secure reset instructions."
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">✓</div>
            <h4 className="text-sm font-bold text-white">Instructions Sent!</h4>
            <p className="text-xs text-slate-300">We dispatched reset guidance to <strong className="text-white">{forgotEmail}</strong>.</p>
            <Button variant="secondary" size="sm" onClick={() => setShowForgotModal(false)} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input label="Email Address" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@company.com" icon={Mail} required />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowForgotModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit">Send Reset Link</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
