import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Bot } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ThemeToggle } from "../../components/common/ThemeToggle";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: "", color: "bg-slate-700" };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (score <= 1)
      return {
        score: 25,
        label: "Weak",
        color: "bg-rose-500",
        text: "text-rose-400",
      };
    if (score === 2)
      return {
        score: 50,
        label: "Fair",
        color: "bg-amber-500",
        text: "text-amber-400",
      };
    if (score === 3)
      return {
        score: 75,
        label: "Good",
        color: "bg-sky-400",
        text: "text-sky-400",
      };
    return {
      score: 100,
      label: "Excellent",
      color: "bg-emerald-400",
      text: "text-emerald-400",
    };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email) errs.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errs.email = "Please provide a valid email format.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (!agreeTerms) errs.terms = "You must accept the terms of service.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name, email, password });
      addToast(
        `Account created! Welcome to InterVue AI, ${name.split(" ")[0]}.`,
        "success",
      );
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-[#07090e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <ThemeToggle className="absolute top-4 right-4 z-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            InterVue AI
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Create your free account
        </h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="p-7 sm:p-8 border-sky-500/30 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              icon={User}
              error={errors.name}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={Mail}
              error={errors.email}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                icon={Lock}
                error={errors.password}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-semibold ${strength.text}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full bg-[#131b2e] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded bg-[#0c1220] border-[#1d2947] text-blue-600 focus:ring-0 w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="text-sky-400 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-sky-400 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-rose-400 mt-1">{errors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account & Start Practice
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
