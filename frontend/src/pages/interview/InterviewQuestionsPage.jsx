import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Mic, StopCircle } from 'lucide-react';
import { AIAvatar } from '../../components/interview/AIAvatar';
import { CandidateCamera } from '../../components/interview/CandidateCamera';
import { ScoreMetricsGrid } from '../../components/reports/ScoreMetricsGrid';
import { QuestionReviewList } from '../../components/reports/QuestionReviewList';
import { useSpeech } from '../../hooks/useSpeech';
import { interviewService, questionService } from '../../services/api';

const PHASE = { INTRO: 'intro', SPEAKING: 'speaking', LISTENING: 'listening', THINKING: 'thinking', DONE: 'done' };

export const InterviewQuestionsPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(state?.questions || []);
  const [role, setRole] = useState('Interview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [history, setHistory] = useState([]);
  const [followupCount, setFollowupCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const [requestingMedia, setRequestingMedia] = useState(false);
  const [mediaPermissionError, setMediaPermissionError] = useState('');
  const [interviewLoaded, setInterviewLoaded] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState('draft');
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [savedRemarks, setSavedRemarks] = useState('');
  const [savedTranscript, setSavedTranscript] = useState([]);
  const [report, setReport] = useState(null);

  const { speaking, listening, speak, listen, stopListening, stopAll } = useSpeech();

  const answerRef = useRef('');
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);
  const questionStartTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const submitAnswerRef = useRef(null);
  const processingRef = useRef(false);
  const noInputPromptedRef = useRef(false);
  phaseRef.current = phase;

  const requestMediaAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaPermissionError('This browser does not support camera and microphone access.');
      return;
    }
    setRequestingMedia(true);
    setMediaPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });
      setMediaStream(stream);
    } catch {
      setMediaPermissionError('Camera and microphone permission is required before the interview can start.');
    } finally {
      setRequestingMedia(false);
    }
  }, []);

  // Load questions if not passed via state
  useEffect(() => {
    Promise.all([questionService.getAll(id), interviewService.getById(id)])
      .then(async ([q, i]) => {
        const qs = q.data?.questions || [];
        if (qs.length) setQuestions(qs.slice(0, 1));
        setRole(i.data?.jobRole || 'Interview');
        setSavedRemarks(i.data?.remarks || '');
        setSavedTranscript(i.data?.transcript || []);
        setReport(i.data?.report || null);
        setInterviewStatus(i.data?.status || 'draft');
        setInterviewLoaded(true);
      })
      .catch(() => {
        setInterviewStatus('unavailable');
        setInterviewLoaded(true);
      });
  }, [id]);

  // Start interview once questions are loaded
  useEffect(() => {
    if (interviewLoaded && interviewStatus === 'draft' && mediaStream && questions.length && phase === PHASE.INTRO) {
      const first = questions[0]?.questionText;
      if (first) {
        setCurrentQuestion(first);
        setPhase(PHASE.SPEAKING);
        questionStartTimerRef.current = setTimeout(() => {
          speak(
            `Hi, this is Arya, your AI interviewer for the ${role} role you applied for.`,
            () => askQuestion(first),
          );
        }, 800);
      }
    }
  }, [questions, interviewLoaded, interviewStatus, mediaStream, role, speak]);

  useEffect(() => () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
  }, [mediaStream]);

  useEffect(() => () => {
    clearTimeout(questionStartTimerRef.current);
    clearTimeout(silenceTimerRef.current);
  }, []);

  const askQuestion = useCallback((text, repeated = false) => {
    if (endedRef.current) return;
    if (!repeated) noInputPromptedRef.current = false;
    setPhase(PHASE.SPEAKING);
    setLiveTranscript('');
    answerRef.current = '';
    speak(text, () => {
      if (phaseRef.current === PHASE.SPEAKING) startListening();
    });
  }, [speak]);

  const startListening = useCallback(() => {
    if (endedRef.current) return;
    setPhase(PHASE.LISTENING);
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (endedRef.current || answerRef.current.trim()) return;
      stopListening();
      if (noInputPromptedRef.current) {
        answerRef.current = '(no answer)';
        submitAnswerRef.current?.();
        return;
      }
      noInputPromptedRef.current = true;
      setPhase(PHASE.SPEAKING);
      speak(
        `I did not receive any input from your side. I will repeat the question. ${currentQuestion}`,
        () => startListening(),
      );
    }, 10000);
    listen(
      (interim) => {
        setLiveTranscript(interim); answerRef.current = interim;
        clearTimeout(silenceTimerRef.current);
        if (interim.trim()) silenceTimerRef.current = setTimeout(() => submitAnswerRef.current?.(), 5000);
      },
      (final) => {
        if (final) { answerRef.current = final; setLiveTranscript(final); }
        if (final.trim()) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => submitAnswerRef.current?.(), 5000);
        }
      }
    );
  }, [listen, stopListening, speak, currentQuestion]);

  const submitAnswer = useCallback(async () => {
    if (endedRef.current || processingRef.current) return;
    processingRef.current = true;
    clearTimeout(silenceTimerRef.current);
    stopListening();
    const answer = answerRef.current.trim() || '(no answer)';
    setPhase(PHASE.THINKING);

    const newHistory = [...history, { question: currentQuestion, answer }];
    setHistory(newHistory);

    const remainingTopics = questions.slice(currentIndex + 1).map((q) => q.category || q.topic || 'General');

    try {
      const res = await interviewService.nextQuestion(id, {
        role,
        current_question: currentQuestion,
        current_answer: answer,
        history: newHistory.slice(-4).map((h) => ({ question: h.question, answer: h.answer })),
        remaining_topics: remainingTopics,
        followup_count: followupCount,
      });

      const next = res.data;
      if (endedRef.current) return;
      if (next.action === 'complete') {
        setRemarks(next.remarks || 'Thank you for completing the interview. Your responses showed your current strengths and areas to keep developing.');
        await finishInterview(next.remarks || 'Thank you for completing the interview. Your responses showed your current strengths and areas to keep developing.', newHistory);
        return;
      }
      const isFollowUp = next.action === 'follow_up';

      if (isFollowUp) {
        setFollowupCount((c) => c + 1);
        setCurrentQuestion(next.question);
        askQuestion(next.question);
      } else {
        const nextIndex = currentIndex + 1;
        setFollowupCount(0);
        setCurrentIndex(nextIndex);
        const nextQ = next.question;
        setQuestions((existing) => [...existing, { questionText: nextQ, category: next.topic || 'General' }]);
        setCurrentQuestion(nextQ);
        askQuestion(nextQ);
      }
    } catch {
      if (endedRef.current) return;
      // Keep the interview moving if question generation is temporarily unavailable.
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        await finishInterview('The interview ended after a temporary issue generating the next question.');
      } else {
        setFollowupCount(0);
        setCurrentIndex(nextIndex);
        const nextQ = questions[nextIndex].questionText;
        setCurrentQuestion(nextQ);
        askQuestion(nextQ);
      }
    }
    finally { processingRef.current = false; }
  }, [currentQuestion, currentIndex, followupCount, history, questions, role, id, askQuestion, stopListening]);

  submitAnswerRef.current = submitAnswer;

  const saveEndedInterview = useCallback(async (finalRemarks = remarks, transcript = history) => {
    try {
      await interviewService.complete(id, { remarks: finalRemarks || 'Thank you for completing the interview.', transcript });
      const refreshed = await interviewService.getById(id);
      setSavedRemarks(refreshed.data?.remarks || finalRemarks || '');
      setSavedTranscript(refreshed.data?.transcript || transcript);
      setReport(refreshed.data?.report || null);
      setInterviewStatus('completed');
      setEndError('');
    } catch (error) {
      try {
        const current = await interviewService.getById(id);
        if (current.data?.status === 'completed') {
          setInterviewStatus('completed');
          setEndError('');
          setSavedRemarks(current.data?.remarks || '');
          setSavedTranscript(current.data?.transcript || []);
          setReport(current.data?.report || null);
          return;
        }
      } catch {
        // Show the original save error and let the candidate retry.
      }
      setEndError(error.response?.data?.message || 'Could not save the completed interview. Retry to finish saving it.');
    }
  }, [id, navigate, remarks, history]);

  const finishInterview = useCallback(async (finalRemarks = remarks, transcript = history) => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimeout(questionStartTimerRef.current);
    clearTimeout(silenceTimerRef.current);
    stopAll();
    setLiveTranscript('');
    setPhase(PHASE.DONE);
    setIsEnding(true);
    mediaStream?.getTracks().forEach((track) => track.stop());
    await saveEndedInterview(finalRemarks, transcript);
    setIsEnding(false);
  }, [stopAll, saveEndedInterview, remarks, mediaStream, history]);

  const progress = questions.length ? Math.round(((currentIndex) / questions.length) * 100) : 0;

  if (!interviewLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-sm text-slate-400">Loading interview...</div>;
  }

  if (interviewStatus === 'completed') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-emerald-400">Interview completed</p>
          <h1 className="text-3xl font-black text-white mt-1">{role}</h1>
          <p className="text-sm text-slate-400 mt-2">This interview has ended. Your transcript and AI performance assessment are available below.</p>
        </div>
        {savedRemarks && <div className="rounded-2xl border border-sky-500/20 bg-[#0d1526] p-5"><p className="text-xs uppercase tracking-wider text-sky-400 mb-2 font-semibold">Interview remarks</p><p className="text-sm text-slate-200 leading-relaxed">{savedRemarks}</p></div>}
        {report && <ScoreMetricsGrid report={report} />}
        <QuestionReviewList reviews={report?.questionReviews || savedTranscript} />
        <button onClick={() => navigate('/history')} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">Back to history</button>
      </div>
    );
  }

  if (interviewStatus === 'unavailable') {
    return <div className="max-w-3xl mx-auto p-8 text-center text-slate-300">Could not load this interview. Return to history and try again.</div>;
  }

  if (!mediaStream) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-sky-500/20 bg-[#0d1526] p-8 text-center shadow-2xl shadow-sky-950/30">
          <AIAvatar />
          <h1 className="mt-8 text-2xl font-black text-white">Ready to meet Arya?</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">Enable your camera and microphone to begin the interview. Arya will not start until both permissions are granted.</p>
          {mediaPermissionError && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300">{mediaPermissionError}</p>}
          <button onClick={requestMediaAccess} disabled={requestingMedia} className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 font-bold text-white disabled:opacity-60">
            {requestingMedia ? 'Requesting permission…' : 'Enable camera and microphone'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#141d33] bg-[#080c16]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white">{role}</span>
        </div>
        {/* Progress bar */}
        <div className="flex-1 mx-8 h-1.5 bg-[#1b2640] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={() => finishInterview()}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-all"
        >
          <StopCircle className="w-3.5 h-3.5" />
          End
        </button>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0">

        {/* Left — AI Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 bg-gradient-to-b from-[#080c16] to-[#07090e]">
          <AIAvatar speaking={speaking} thinking={phase === PHASE.THINKING} />

          {/* Current question bubble */}
          <div className="max-w-lg w-full">
            <div className="bg-[#0d1526] border border-sky-500/20 rounded-2xl p-5 shadow-xl shadow-sky-500/5">
              <p className="text-[10px] uppercase tracking-wider text-sky-400 mb-2 font-semibold">
                {phase === PHASE.THINKING ? 'Processing your answer...' : phase === PHASE.DONE ? 'Interview complete' : 'Current Question'}
              </p>
              <p className="text-sm text-white leading-relaxed font-medium">
                {currentQuestion || 'Preparing your interview...'}
              </p>
            </div>
          </div>
        </div>

        {/* Right — Candidate */}
        <div className="w-full lg:w-80 flex flex-col gap-4 p-4 bg-[#080c16] border-l border-[#141d33]">

          {/* Webcam */}
          <CandidateCamera stream={mediaStream} />

          {/* Live transcript */}
          <div className="flex-1 bg-[#0a0f1d] border border-[#1b2640] rounded-2xl p-4 min-h-[120px]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">Your Answer</p>
            {listening && !liveTranscript && (
              <div className="flex items-center gap-2 text-sky-400">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
                <span className="text-xs">Listening...</span>
              </div>
            )}
            <p className="text-sm text-slate-200 leading-relaxed">
              {liveTranscript || (phase === PHASE.SPEAKING ? 'Listen to the question...' : '')}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            {phase === PHASE.SPEAKING && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-sky-400">
                <Mic className="w-4 h-4 animate-pulse" />
                AI is speaking...
              </div>
            )}

            {phase === PHASE.THINKING && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-violet-400">
                <span className="animate-spin">⚙</span>
                Generating next question...
              </div>
            )}

            {phase === PHASE.DONE && (
              <div className="space-y-3 text-center">
                <p className="text-sm text-emerald-400 font-semibold py-3">Interview ended</p>
                {isEnding && <p className="text-xs text-slate-400">Saving transcript and generating your performance report...</p>}
                {endError && <>
                  <p className="text-xs text-rose-400">{endError}</p>
                  <button onClick={() => saveEndedInterview()} className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600">Retry save and finish</button>
                </>}
              </div>
            )}
          </div>

          {/* Question counter dots */}
          <div className="flex flex-wrap gap-1.5 justify-center pb-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentIndex ? 'bg-emerald-500' : i === currentIndex ? 'bg-sky-400 scale-125' : 'bg-[#1b2640]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
