import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, SkipForward, StopCircle, ChevronRight } from 'lucide-react';
import { AIAvatar } from '../../components/interview/AIAvatar';
import { CandidateCamera } from '../../components/interview/CandidateCamera';
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
  const [cameraOn, setCameraOn] = useState(true);

  const { speaking, listening, transcript, speak, stopSpeaking, listen, stopListening } = useSpeech();

  const answerRef = useRef('');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Load questions if not passed via state
  useEffect(() => {
    Promise.all([questionService.getAll(id), interviewService.getById(id)])
      .then(([q, i]) => {
        const qs = q.data?.questions || [];
        if (qs.length) setQuestions(qs);
        setRole(i.data?.jobRole || 'Interview');
      })
      .catch(() => {});
  }, [id]);

  // Start interview once questions are loaded
  useEffect(() => {
    if (questions.length && phase === PHASE.INTRO) {
      const first = questions[0]?.questionText;
      if (first) {
        setCurrentQuestion(first);
        setTimeout(() => askQuestion(first), 800);
      }
    }
  }, [questions]);

  const askQuestion = useCallback((text) => {
    setPhase(PHASE.SPEAKING);
    setLiveTranscript('');
    answerRef.current = '';
    speak(text, () => {
      if (phaseRef.current === PHASE.SPEAKING) startListening();
    });
  }, [speak]);

  const startListening = useCallback(() => {
    setPhase(PHASE.LISTENING);
    listen(
      (interim) => { setLiveTranscript(interim); answerRef.current = interim; },
      (final) => {
        answerRef.current = final;
        setLiveTranscript(final);
      }
    );
  }, [listen]);

  const submitAnswer = useCallback(async () => {
    stopListening();
    const answer = answerRef.current.trim() || '(no answer)';
    setPhase(PHASE.THINKING);

    const newHistory = [...history, { question: currentQuestion, answer }];
    setHistory(newHistory);

    const remainingTopics = questions
      .slice(currentIndex + 1)
      .map((q) => q.category || q.topic || 'General');

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
      const isFollowUp = next.action === 'follow_up';

      if (isFollowUp) {
        setFollowupCount((c) => c + 1);
        setCurrentQuestion(next.question);
        askQuestion(next.question);
      } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
          finishInterview();
        } else {
          setFollowupCount(0);
          setCurrentIndex(nextIndex);
          const nextQ = questions[nextIndex].questionText;
          setCurrentQuestion(nextQ);
          askQuestion(nextQ);
        }
      }
    } catch {
      // Fallback: just go to next planned question
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        finishInterview();
      } else {
        setFollowupCount(0);
        setCurrentIndex(nextIndex);
        const nextQ = questions[nextIndex].questionText;
        setCurrentQuestion(nextQ);
        askQuestion(nextQ);
      }
    }
  }, [currentQuestion, currentIndex, followupCount, history, questions, role, id, askQuestion, stopListening]);

  const skipQuestion = useCallback(() => {
    stopListening();
    stopSpeaking();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      finishInterview();
    } else {
      setFollowupCount(0);
      setCurrentIndex(nextIndex);
      const nextQ = questions[nextIndex].questionText;
      setCurrentQuestion(nextQ);
      askQuestion(nextQ);
    }
  }, [currentIndex, questions, askQuestion, stopListening, stopSpeaking]);

  const finishInterview = useCallback(() => {
    stopListening();
    stopSpeaking();
    setPhase(PHASE.DONE);
    speak("Thank you for completing the interview. Great job! You will be redirected shortly.", () => {
      setTimeout(() => navigate('/history'), 2000);
    });
  }, [stopListening, stopSpeaking, speak, navigate]);

  const progress = questions.length ? Math.round(((currentIndex) / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#141d33] bg-[#080c16]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white">{role}</span>
          <span className="text-[10px] text-slate-400">
            Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="flex-1 mx-8 h-1.5 bg-[#1b2640] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={finishInterview}
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
          <CandidateCamera active={cameraOn} />

          {/* Camera toggle */}
          <button
            onClick={() => setCameraOn((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors self-end"
          >
            {cameraOn ? 'Turn off camera' : 'Turn on camera'}
          </button>

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
            {phase === PHASE.LISTENING && (
              <button
                onClick={submitAnswer}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-sky-500 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
                Submit Answer
              </button>
            )}

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

            {(phase === PHASE.LISTENING || phase === PHASE.SPEAKING) && (
              <button
                onClick={skipQuestion}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-[#1b2640] hover:border-slate-500 flex items-center justify-center gap-2 transition-all"
              >
                <SkipForward className="w-4 h-4" />
                Skip Question
              </button>
            )}

            {phase === PHASE.DONE && (
              <div className="text-center text-sm text-emerald-400 font-semibold py-3">
                ✓ Interview Complete
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
