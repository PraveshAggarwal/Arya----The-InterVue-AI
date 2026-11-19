import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import {
  Mic,
  StopCircle,
  Volume2,
  Clock,
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Loader2,
  LayoutDashboard,
  History,
  CalendarClock,
} from "lucide-react";
import { AIAvatar } from "../../components/interview/AIAvatar";
import { CandidateCamera } from "../../components/interview/CandidateCamera";
import { ScoreMetricsGrid } from "../../components/reports/ScoreMetricsGrid";
import { KeyTakeaways } from "../../components/reports/KeyTakeaways";
import { QuestionReviewList } from "../../components/reports/QuestionReviewList";
import { useSpeech } from "../../hooks/useSpeech";
import { interviewService, questionService } from "../../services/api";
import { formatTime } from "../../utils/formatters";

const PHASE = {
  INTRO: "intro",
  SPEAKING: "speaking",
  LISTENING: "listening",
  THINKING: "thinking",
  DONE: "done",
};

export const InterviewQuestionsPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(state?.questions || []);
  const [role, setRole] = useState("Interview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [history, setHistory] = useState([]);
  const [followupCount, setFollowupCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const [requestingMedia, setRequestingMedia] = useState(false);
  const [mediaPermissionError, setMediaPermissionError] = useState("");
  const [interviewLoaded, setInterviewLoaded] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("draft");
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState("");
  const [remarks, setRemarks] = useState("");
  const [savedRemarks, setSavedRemarks] = useState("");
  const [savedTranscript, setSavedTranscript] = useState([]);
  const [report, setReport] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [interviewStartedAt, setInterviewStartedAt] = useState(null);
  const [interviewCompletedAt, setInterviewCompletedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { speaking, listening, speak, listen, stopListening, stopAll } =
    useSpeech();

  const answerRef = useRef("");
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);
  const questionStartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const submitAnswerRef = useRef(null);
  const finishInterviewRef = useRef(null);
  const processingRef = useRef(false);
  const noInputPromptedRef = useRef(0);
  const turnRef = useRef(0);
  const startRequestedRef = useRef(false);
  const askQuestionRef = useRef(null);
  const fullyCompletedRef = useRef(false);
  const historyRef = useRef(history);
  const currentIndexRef = useRef(currentIndex);
  historyRef.current = history;
  currentIndexRef.current = currentIndex;
  phaseRef.current = phase;

  const requestMediaAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaPermissionError(
        "This browser does not support camera and microphone access.",
      );
      return;
    }
    setRequestingMedia(true);
    setMediaPermissionError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: 640, height: 480, facingMode: "user" },
      });
      setMediaStream(stream);
    } catch {
      setMediaPermissionError(
        "Camera and microphone permission are required to participate in the mock interview.",
      );
    } finally {
      setRequestingMedia(false);
    }
  }, []);

  // Load questions if not passed via state
  useEffect(() => {
    Promise.all([questionService.getAll(id), interviewService.getById(id)])
      .then(async ([q, i]) => {
        const qs = q.data?.questions || [];
        if (qs.length) setQuestions(qs);
        setRole(i.data?.jobRole || "Interview");
        setSavedRemarks(i.data?.remarks || "");
        setSavedTranscript(i.data?.transcript || []);
        setReport(i.data?.report || null);
        setInterviewStatus(i.data?.status || "draft");
        setInterviewStartedAt(i.data?.startedAt || null);
        setInterviewCompletedAt(i.data?.completedAt || null);
        setInterviewLoaded(true);
      })
      .catch(() => {
        setInterviewStatus("unavailable");
        setInterviewLoaded(true);
      });
  }, [id]);

  // Persist the start time once the candidate has enabled their microphone.
  useEffect(() => {
    if (
      interviewLoaded &&
      interviewStatus === "draft" &&
      mediaStream &&
      questions.length &&
      phase === PHASE.INTRO &&
      !startRequestedRef.current
    ) {
      const first = questions[0]?.questionText;
      if (first) {
        startRequestedRef.current = true;
        interviewService
          .start(id)
          .then(({ data }) => {
            const startedAt = data?.startedAt || new Date().toISOString();
            setInterviewStartedAt(startedAt);
            setCurrentQuestion(first);
            setPhase(PHASE.SPEAKING);
            questionStartTimerRef.current = setTimeout(() => {
              speak(
                `Hi, I'm Arya, your AI interviewer developed by Pravesh. Thanks for joining me. We'll talk about your experience and the ${role} role. Take a moment to think before answering, and let me know if you'd like me to repeat a question.`,
                () => askQuestionRef.current?.(first),
              );
            }, 800);
          })
          .catch((error) => {
            startRequestedRef.current = false;
            setMediaPermissionError(
              error.response?.data?.message ||
                "Could not start this interview. Please try again.",
            );
          });
      }
    }
  }, [
    questions,
    interviewLoaded,
    interviewStatus,
    mediaStream,
    role,
    speak,
    phase,
    id,
  ]);

  useEffect(() => {
    if (!interviewStartedAt || interviewStatus !== "draft") return undefined;
    const updateElapsed = () =>
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(interviewStartedAt).getTime()) / 1000,
          ),
        ),
      );
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [interviewStartedAt, interviewStatus]);

  useEffect(
    () => () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    },
    [mediaStream],
  );

  useEffect(
    () => () => {
      clearTimeout(questionStartTimerRef.current);
      clearTimeout(silenceTimerRef.current);
    },
    [],
  );

  // If candidate clicks browser back button while interview is active, cleanly end the interview
  useEffect(() => {
    if (phase === PHASE.INTRO || interviewStatus === "completed" || endedRef.current) {
      return undefined;
    }

    // Push a dummy history state so browser Back triggers popstate on this page
    window.history.pushState({ inInterview: true }, "");

    const handlePopState = () => {
      if (!endedRef.current && phaseRef.current !== PHASE.DONE) {
        finishInterviewRef.current?.(
          "Interview was ended early because the candidate navigated back.",
          historyRef.current || [],
          false,
        );
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [phase, interviewStatus]);

  // If candidate navigates away or unmounts unexpectedly, ensure session is completed in database
  useEffect(() => {
    return () => {
      if (startRequestedRef.current && !endedRef.current) {
        endedRef.current = true;
        clearTimeout(questionStartTimerRef.current);
        clearTimeout(silenceTimerRef.current);
        stopAll();
        mediaStream?.getTracks().forEach((track) => track.stop());
        interviewService
          .complete(id, {
            remarks: "Interview was ended early via browser navigation.",
            transcript: historyRef.current || [],
            completedMainQuestions: Math.min(currentIndexRef.current || 0, 15),
          })
          .catch(() => {});
      }
    };
  }, [id, mediaStream, stopAll]);

  const askQuestion = useCallback(
    (text, repeated = false, response = "") => {
      if (endedRef.current) return;
      const turnId = ++turnRef.current;
      noInputPromptedRef.current = 0;
      clearTimeout(silenceTimerRef.current);
      stopListening();
      setPhase(PHASE.SPEAKING);
      setLiveTranscript("");
      answerRef.current = "";
      speak([response, text].filter(Boolean).join(" "), () => {
        if (
          !endedRef.current &&
          turnId === turnRef.current &&
          phaseRef.current === PHASE.SPEAKING
        ) {
          startListening(turnId);
        }
      });
    },
    [speak, stopListening],
  );
  askQuestionRef.current = askQuestion;

  const startListening = useCallback(
    (turnId) => {
      if (endedRef.current || turnId !== turnRef.current) return;
      setPhase(PHASE.LISTENING);
      clearTimeout(silenceTimerRef.current);
      // Ignore the short tail of Arya's own audio picked up by the microphone
      const acceptSpeechAfter = Date.now() + 800;
      silenceTimerRef.current = setTimeout(() => {
        if (
          endedRef.current ||
          turnId !== turnRef.current ||
          answerRef.current.trim()
        )
          return;
        noInputPromptedRef.current += 1;
        if (noInputPromptedRef.current > 1) {
          answerRef.current = "(no answer)";
          submitAnswerRef.current?.();
          return;
        }
        setPhase(PHASE.SPEAKING);
        stopListening(() => {
          if (endedRef.current || turnId !== turnRef.current) return;
          speak(
            `Take your time. There is no rush. Let me repeat the question: ${currentQuestion}`,
            () => startListening(turnId),
          );
        });
      }, 15000);

      listen(
        (interim) => {
          if (
            endedRef.current ||
            turnId !== turnRef.current ||
            Date.now() < acceptSpeechAfter
          )
            return;
          setLiveTranscript(interim);
          answerRef.current = interim;
          if (interim.trim()) noInputPromptedRef.current = 0;
          clearTimeout(silenceTimerRef.current);
          if (interim.trim()) {
            silenceTimerRef.current = setTimeout(() => {
              if (turnId === turnRef.current) submitAnswerRef.current?.();
            }, 10000);
          }
        },
        (final) => {
          if (
            endedRef.current ||
            turnId !== turnRef.current ||
            Date.now() < acceptSpeechAfter
          )
            return;
          if (final) {
            answerRef.current = final;
            setLiveTranscript(final);
            if (final.trim()) noInputPromptedRef.current = 0;
          }
          if (final.trim()) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (turnId === turnRef.current) submitAnswerRef.current?.();
            }, 10000);
          }
        },
      );
    },
    [listen, stopListening, speak, currentQuestion],
  );

  const submitAnswer = useCallback(async () => {
    if (endedRef.current || processingRef.current) return;
    processingRef.current = true;
    clearTimeout(silenceTimerRef.current);
    stopListening();
    const answer = answerRef.current.trim() || "(no answer)";
    setPhase(PHASE.THINKING);

    const newHistory = [...history, { question: currentQuestion, answer }];
    setHistory(newHistory);

    const remainingTopics = questions
      .slice(currentIndex + 1)
      .map((q) => q.category || q.topic || "General");

    try {
      const res = await interviewService.nextQuestion(id, {
        role,
        current_question: currentQuestion,
        current_answer: answer,
        history: newHistory
          .slice(-12)
          .map((h) => ({ question: h.question, answer: h.answer })),
        remaining_topics: remainingTopics,
        remaining_questions: questions
          .slice(currentIndex + 1)
          .map((q) => q.questionText),
        main_question_number: currentIndex + 1,
        total_questions: 15,
        followup_count: followupCount,
      });

      const next = res.data;
      if (endedRef.current) return;
      if (next.action === "complete") {
        const finalRemarks =
          next.remarks ||
          "Thank you for completing the interview. Your responses showed your current strengths and areas to keep developing.";
        setRemarks(finalRemarks);
        const closing =
          next.response ||
          "Thank you for sharing your experience with me. That concludes our interview.";
        setPhase(PHASE.SPEAKING);
        speak(closing, () =>
          finishInterviewRef.current?.(finalRemarks, newHistory, true),
        );
        return;
      }
      const isFollowUp =
        next.action === "follow_up" || next.action === "clarify";

      if (isFollowUp) {
        setFollowupCount((c) => c + 1);
        const followUpText =
          next.question ||
          "Could you tell me a little more about that and give a specific example?";
        setCurrentQuestion(followUpText);
        askQuestion(
          followUpText,
          false,
          next.response || "Thanks for sharing that.",
        );
      } else {
        const nextIndex = currentIndex + 1;
        setFollowupCount(0);
        setCurrentIndex(nextIndex);
        const nextQ = next.question;
        setCurrentQuestion(nextQ);
        askQuestion(nextQ, false, next.response || "Thank you.");
      }
    } catch {
      if (endedRef.current) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        await finishInterviewRef.current?.(
          "The interview ended after a temporary issue generating the next question.",
          newHistory,
          nextIndex >= 15,
        );
      } else {
        setFollowupCount(0);
        setCurrentIndex(nextIndex);
        const nextQ = questions[nextIndex].questionText;
        setCurrentQuestion(nextQ);
        askQuestion(
          nextQ,
          false,
          "Thank you. Let’s move on to another question.",
        );
      }
    } finally {
      processingRef.current = false;
    }
  }, [
    currentQuestion,
    currentIndex,
    followupCount,
    history,
    questions,
    role,
    id,
    askQuestion,
    stopListening,
    speak,
  ]);

  submitAnswerRef.current = submitAnswer;

  const saveEndedInterview = useCallback(
    async (
      finalRemarks = remarks,
      transcript = history,
      fullyCompleted = fullyCompletedRef.current,
    ) => {
      try {
        await interviewService.complete(id, {
          remarks: finalRemarks || "Thank you for completing the interview.",
          transcript,
          completedMainQuestions: fullyCompleted
            ? 15
            : Math.min(currentIndex + (phase === PHASE.THINKING ? 1 : 0), 15),
        });
        const refreshed = await interviewService.getById(id);
        setSavedRemarks(refreshed.data?.remarks || finalRemarks || "");
        setSavedTranscript(refreshed.data?.transcript || transcript);
        setReport(refreshed.data?.report || null);
        setInterviewStartedAt(refreshed.data?.startedAt || interviewStartedAt);
        setInterviewCompletedAt(refreshed.data?.completedAt || null);
        setInterviewStatus("completed");
        setEndError("");
      } catch (error) {
        try {
          const current = await interviewService.getById(id);
          if (current.data?.status === "completed") {
            setInterviewStatus("completed");
            setEndError("");
            setSavedRemarks(current.data?.remarks || "");
            setSavedTranscript(current.data?.transcript || []);
            setReport(current.data?.report || null);
            setInterviewStartedAt(
              current.data?.startedAt || interviewStartedAt,
            );
            setInterviewCompletedAt(current.data?.completedAt || null);
            return;
          }
        } catch {
          // Fall through to show error
        }
        setEndError(
          error.response?.data?.message ||
            "Could not save the completed interview. Retry to finish saving it.",
        );
      }
    },
    [id, remarks, history, currentIndex, phase, interviewStartedAt],
  );

  const finishInterview = useCallback(
    async (
      finalRemarks = remarks,
      transcript = history,
      fullyCompleted = false,
    ) => {
      if (endedRef.current) return;
      fullyCompletedRef.current = fullyCompleted;
      endedRef.current = true;
      clearTimeout(questionStartTimerRef.current);
      clearTimeout(silenceTimerRef.current);
      stopAll();
      setLiveTranscript("");
      setPhase(PHASE.DONE);
      setIsEnding(true);
      mediaStream?.getTracks().forEach((track) => track.stop());
      await saveEndedInterview(finalRemarks, transcript);
      setIsEnding(false);
    },
    [stopAll, saveEndedInterview, remarks, mediaStream, history],
  );

  finishInterviewRef.current = finishInterview;

  // 1. Loading Screen
  if (!interviewLoaded) {
    return (
      <div className="interview-theme min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-4 text-slate-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 shadow-xl shadow-sky-500/20 animate-pulse">
          <div className="w-full h-full bg-[#07090e] rounded-[14px] flex items-center justify-center">
            <Bot className="w-7 h-7 text-sky-400" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold text-white">
            Preparing Your Interview Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connecting session and retrieving question blueprints...
          </p>
        </div>
      </div>
    );
  }

  // 2. Completed Debrief Screen
  if (interviewStatus === "completed") {
    return (
      <div className="interview-theme min-h-screen bg-[#07090e] text-slate-100 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1629] via-[#09101e] to-[#070b16] border border-sky-500/30 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Interview Completed
                </span>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight break-words">
                  {role}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  Your mock session with Arya has concluded. A full transcript
                  analysis, scoring breakdown, and executive feedback are
                  generated below.
                </p>
                {(interviewStartedAt || interviewCompletedAt) && (
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                    {interviewStartedAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-sky-400" />
                        Started{" "}
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(interviewStartedAt))}
                      </span>
                    )}
                    {interviewCompletedAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Completed{" "}
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(interviewCompletedAt))}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
                <button
                  onClick={() => navigate("/history")}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#11192e] hover:bg-[#18233d] text-slate-200 hover:text-white border border-[#1f2b48] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <History className="w-4 h-4 text-sky-400" />
                  <span>Interview History</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Remarks Card */}
          {savedRemarks && (
            <div className="p-6 rounded-2xl border border-sky-500/25 bg-[#0b1120] relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Arya's Executive Remarks
                </h3>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                "{savedRemarks}"
              </p>
            </div>
          )}

          {/* Detailed Score Metrics */}
          {report && <ScoreMetricsGrid report={report} />}

          {/* Strengths, improvement areas, and next steps */}
          {report && <KeyTakeaways report={report} />}

          {/* Full Question Breakdown */}
          <QuestionReviewList
            reviews={report?.questionReviews || savedTranscript}
          />

          {/* Footer CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#141d33]">
            <Link
              to="/interview/setup"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5"
            >
              <span>Start Another Mock Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-xs text-slate-500">
              Session ID: <span className="font-mono text-slate-400">{id}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unavailable Screen
  if (interviewStatus === "unavailable") {
    return (
      <div className="interview-theme min-h-screen bg-[#07090e] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c1220] border border-rose-500/20 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">
            Interview Session Unavailable
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            We couldn't retrieve the questions or metadata for this session. It
            might have expired or been removed.
          </p>
          <button
            onClick={() => navigate("/history")}
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Return to Interview History
          </button>
        </div>
      </div>
    );
  }

  // 4. Pre-interview microphone check-in screen
  if (!mediaStream) {
    return (
      <div className="interview-theme min-h-screen bg-[#07090e] flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl border border-sky-500/25 bg-[#0b1120] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10">
            <div className="flex justify-center mb-4 sm:mb-6">
              <AIAvatar size="large" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/25 text-[11px] sm:text-xs text-blue-400 font-semibold mb-3">
              <Mic className="w-3.5 h-3.5" />
              Camera & Microphone Check-in
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              Ready to meet Arya?
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your mock interview for{" "}
              <strong className="text-sky-300">{role}</strong> is ready. Enable
              your camera and microphone to begin. Your camera is shown live and
              is not recorded or saved.
            </p>

            {/* Checklist */}
            <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-[#080d18] border border-[#162138] text-left space-y-2 text-[11px] sm:text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Camera preview is live in your browser only; no photo or video
                  recording is saved.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Microphone is used for live, continuous speech recognition
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Arya will wait patiently while you form your thoughts
                </span>
              </div>
            </div>

            {mediaPermissionError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{mediaPermissionError}</span>
              </div>
            )}

            <button
              onClick={requestMediaAccess}
              disabled={requestingMedia}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 py-3 sm:py-3.5 px-4 sm:px-5 font-bold text-white text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {requestingMedia ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Requesting camera and microphone access...</span>
                </>
              ) : (
                <>
                  <span>Enable Camera & Enter Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4">
              <button
                onClick={() => navigate("/interview/setup")}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel and return to interview setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Active Studio Interview Room
  return (
    <div className="interview-theme min-h-screen bg-[#07090e] text-slate-100 flex flex-col select-none">
      {/* Sleek Top Studio Bar */}
      <header className="h-16 px-3 sm:px-6 lg:px-8 border-b border-[#141d33] bg-[#080d18]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-30 gap-2">
        {/* Left: Role and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-[#07090e] rounded-[6px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-white tracking-tight truncate max-w-[95px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-xs">
                {role}
              </span>
              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                Live Studio
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Role-specific AI interview practice
            </p>
          </div>
        </div>

        {/* Center: elapsed interview time */}
        <div
          className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-xs font-mono text-sky-300"
          aria-label="Interview elapsed time"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        {/* Right: End Session Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {showEndConfirm ? (
            <div className="flex items-center gap-1 animate-in fade-in">
              <button
                onClick={() => finishInterview()}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                End
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-2 py-1.5 rounded-lg bg-[#141d33] hover:bg-[#1a253e] text-slate-300 text-[11px] sm:text-xs transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
              title="End Interview Call"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">End Call</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full items-stretch">
        {/* Left Primary Tile: AI Interviewer Arya */}
        <div className="flex-1 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0a0f1d] via-[#080d1a] to-[#070b16] border border-[#17233d] p-4 sm:p-6 lg:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden min-h-[360px] sm:min-h-[460px]">
          {/* Subtle studio glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1629] border border-[#1b2742] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">Arya</span>
              <span className="text-[10px] text-slate-400">
                - Senior Interview Lead
              </span>
            </div>

            {/* Current Phase Pill */}
            <div>
              {phase === PHASE.SPEAKING && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  Arya Speaking
                </span>
              )}

              {phase === PHASE.LISTENING && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Listening to Candidate
                </span>
              )}

              {phase === PHASE.THINKING && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  Analyzing Response
                </span>
              )}

              {phase === PHASE.DONE && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Session Finished
                </span>
              )}
            </div>
          </div>

          {/* Center Stage: AI Avatar Visualizer */}
          <div className="py-3 sm:py-6 flex flex-col items-center justify-center relative z-10">
            <AIAvatar
              speaking={speaking}
              thinking={phase === PHASE.THINKING}
              size="large"
            />
          </div>

          {/* Bottom Card: Current Question */}
          <div className="relative z-10 w-full mt-auto pt-3">
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0d1424]/90 backdrop-blur-md border border-sky-500/25 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  {phase === PHASE.THINKING
                    ? "Processing your response..."
                    : phase === PHASE.DONE
                      ? "Interview concluded"
                      : "Current question"}
                </span>

                {phase === PHASE.LISTENING && (
                  <button
                    onClick={() =>
                      speak(`Let me repeat the question: ${currentQuestion}`)
                    }
                    className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Repeat Question"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Repeat</span>
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm md:text-base text-white font-medium leading-relaxed break-words">
                {currentQuestion || "Preparing your interview questions..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Secondary Column: Live camera preview and transcript */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
          <CandidateCamera stream={mediaStream} isListening={listening} />
          {/* Real-time Transcription & Response Card */}
          <div className="flex-1 rounded-2xl bg-[#090e1c] border border-[#17223b] p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#141d33]">
                <div className="flex items-center gap-1.5">
                  <Mic
                    className={`w-3.5 h-3.5 ${listening ? "text-emerald-400 animate-pulse" : "text-slate-400"}`}
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Your Spoken Answer
                  </span>
                </div>
                {listening && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 animate-pulse">
                    LIVE MIC
                  </span>
                )}
              </div>

              {/* Spoken text area */}
              <div className="min-h-28 sm:min-h-36 max-h-44 sm:max-h-56 overflow-y-auto pr-1 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {liveTranscript ? (
                  <p className="italic text-slate-100">{liveTranscript}</p>
                ) : phase === PHASE.LISTENING ? (
                  <div className="text-slate-400 flex flex-col items-center justify-center py-8 text-center gap-2">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs">
                      Arya is listening... Speak your answer clearly.
                    </span>
                  </div>
                ) : phase === PHASE.SPEAKING ? (
                  <div className="text-slate-400 text-center py-8 text-xs">
                    Please listen as Arya reads the question.
                  </div>
                ) : phase === PHASE.THINKING ? (
                  <div className="text-violet-300 text-center py-8 text-xs flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                    <span>
                      Evaluating your answer and deciding follow-up...
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs">
                    Ready for question response...
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons for Candidate */}
            <div className="mt-4 pt-3 border-t border-[#141d33] space-y-2.5">
              {/* Active Voice Status indicator */}
              {phase === PHASE.LISTENING && (
                <div className="py-2.5 px-4 rounded-xl bg-[#0d1629] border border-emerald-500/25 flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Arya is listening... Speak your answer</span>
                </div>
              )}

              {phase === PHASE.THINKING && (
                <div className="py-2 text-center text-xs text-violet-300 font-medium">
                  Generating evaluation & next turn...
                </div>
              )}

              {phase === PHASE.SPEAKING && (
                <div className="py-2 text-center text-xs text-sky-400 font-medium flex items-center justify-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Arya is speaking...</span>
                </div>
              )}

              {phase === PHASE.DONE && (
                <div className="space-y-2 text-center">
                  <p className="text-xs text-emerald-400 font-bold">
                    Interview Concluded
                  </p>
                  {isEnding && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>
                        Saving transcript and synthesizing performance
                        scorecard...
                      </span>
                    </div>
                  )}
                  {endError && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-rose-400">{endError}</p>
                      <button
                        onClick={() => saveEndedInterview()}
                        className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
                      >
                        Retry saving report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
