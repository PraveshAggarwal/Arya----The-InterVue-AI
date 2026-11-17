import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Mic, SkipForward, StopCircle, ChevronRight, PlayCircle } from 'lucide-react';
import { AIAvatar } from '../../components/interview/AIAvatar';
import { CandidateCamera } from '../../components/interview/CandidateCamera';
import { useSpeech } from '../../hooks/useSpeech';
import { useToast } from '../../context/ToastContext';
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
  const [interviewLoaded, setInterviewLoaded] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState('draft');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState('');

  const { speaking, listening, transcript, speak, stopSpeaking, listen, stopListening, stopAll } = useSpeech();
  const { addToast } = useToast();

  const answerRef = useRef('');
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);
  const questionStartTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingBlobRef = useRef(null);
  phaseRef.current = phase;

  const handleMediaStream = useCallback((stream) => {
    if (!stream) return;
    if (endedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    if (!window.MediaRecorder) {
      setEndError('Recording is not supported by this browser.');
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported
      ? ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find((type) => MediaRecorder.isTypeSupported(type))
      : undefined;
    try {
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data?.size) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || recordingChunksRef.current[0]?.type || 'video/webm';
        const blob = new Blob(recordingChunksRef.current, { type });
        recordingBlobRef.current = blob.size ? blob : null;
        mediaRecorderRef.current = null;
      };
      mediaRecorderRef.current = recorder;
      recorder.start(1000);
    } catch {
      setEndError('Could not start recording in this browser.');
    }
  }, []);

  const stopRecording = useCallback(() => new Promise((resolve) => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      resolve(recordingBlobRef.current);
      return;
    }
    recorder.addEventListener('stop', () => resolve(recordingBlobRef.current), { once: true });
    recorder.stop();
  }), []);

  // Load questions if not passed via state
  useEffect(() => {
    Promise.all([questionService.getAll(id), interviewService.getById(id)])
      .then(async ([q, i]) => {
        const qs = q.data?.questions || [];
        if (qs.length) setQuestions(qs);
        setRole(i.data?.jobRole || 'Interview');
        setInterviewStatus(i.data?.status || 'draft');
        setInterviewLoaded(true);
        if (i.data?.status === 'completed' && i.data?.hasRecording) {
          setRecordingLoading(true);
          try {
            const { data: blob } = await interviewService.getRecording(id);
            setRecordingUrl(URL.createObjectURL(blob));
          } catch {
            addToast('The interview is complete, but its recording could not be loaded.', 'error');
          } finally {
            setRecordingLoading(false);
          }
        }
      })
      .catch(() => {
        setInterviewStatus('unavailable');
        setInterviewLoaded(true);
      });
  }, [id, addToast]);

  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  // Start interview once questions are loaded
  useEffect(() => {
    if (interviewLoaded && interviewStatus === 'draft' && questions.length && phase === PHASE.INTRO) {
      const first = questions[0]?.questionText;
      if (first) {
        setCurrentQuestion(first);
        questionStartTimerRef.current = setTimeout(() => askQuestion(first), 800);
      }
    }
  }, [questions, interviewLoaded, interviewStatus]);

  useEffect(() => () => clearTimeout(questionStartTimerRef.current), []);

  const askQuestion = useCallback((text) => {
    if (endedRef.current) return;
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
      if (endedRef.current) return;
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
      if (endedRef.current) return;
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
    if (endedRef.current) return;
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

  const saveEndedInterview = useCallback(async (blob) => {
    const form = new FormData();
    if (blob?.size) {
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const mimeType = extension === 'mp4' ? 'video/mp4' : 'video/webm';
      const recording = new File([blob], `interview-${id}.${extension}`, { type: mimeType });
      form.append('recording', recording);
    }
    try {
      await interviewService.complete(id, form);
      setInterviewStatus('completed');
      setEndError('');
      navigate('/history', { replace: true });
    } catch (error) {
      try {
        const current = await interviewService.getById(id);
        if (current.data?.status === 'completed') {
          setInterviewStatus('completed');
          setEndError('');
          navigate('/history', { replace: true });
          return;
        }
      } catch {
        // Show the original save error and let the candidate retry.
      }
      setEndError(error.response?.data?.message || 'Could not save the completed interview. Retry to finish saving it.');
    }
  }, [id, navigate]);

  const finishInterview = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimeout(questionStartTimerRef.current);
    stopAll();
    setLiveTranscript('');
    setPhase(PHASE.DONE);
    setIsEnding(true);
    const recording = await stopRecording();
    setCameraOn(false);
    if (!recording) addToast('No recording was captured. This interview will still be marked complete.', 'warning');
    await saveEndedInterview(recording);
    setIsEnding(false);
  }, [stopAll, stopRecording, saveEndedInterview, addToast]);

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
          <p className="text-sm text-slate-400 mt-2">This interview has ended and cannot be restarted. You can watch its recording below.</p>
        </div>
        {recordingLoading ? (
          <div className="rounded-2xl border border-[#1b2640] bg-[#0a0f1d] p-8 text-center text-sm text-slate-400">Loading recording...</div>
        ) : recordingUrl ? (
          <video className="w-full rounded-2xl bg-black" src={recordingUrl} controls playsInline />
        ) : (
          <div className="rounded-2xl border border-[#1b2640] bg-[#0a0f1d] p-8 text-center text-sm text-slate-400">
            <PlayCircle className="w-8 h-8 mx-auto mb-3 text-slate-500" />
            No recording is available for this interview.
          </div>
        )}
        <button onClick={() => navigate('/history')} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold">Back to history</button>
      </div>
    );
  }

  if (interviewStatus === 'unavailable') {
    return <div className="max-w-3xl mx-auto p-8 text-center text-slate-300">Could not load this interview. Return to history and try again.</div>;
  }

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
          <CandidateCamera active={cameraOn && interviewStatus === 'draft'} onStream={handleMediaStream} />

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
              <div className="space-y-3 text-center">
                <p className="text-sm text-emerald-400 font-semibold py-3">Interview ended</p>
                {isEnding && <p className="text-xs text-slate-400">Saving recording...</p>}
                {endError && <>
                  <p className="text-xs text-rose-400">{endError}</p>
                  <button onClick={() => saveEndedInterview(recordingBlobRef.current)} className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600">Retry save and finish</button>
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
