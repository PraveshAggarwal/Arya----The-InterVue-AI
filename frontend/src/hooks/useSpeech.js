import { useCallback, useEffect, useRef, useState } from 'react';

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const speechRequestRef = useRef(0);
  const voicesRef = useRef([]);
  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => { voicesRef.current = synth?.getVoices?.() || []; };
    loadVoices();
    synth?.addEventListener?.('voiceschanged', loadVoices);
    return () => synth?.removeEventListener?.('voiceschanged', loadVoices);
  }, [synth]);

  const speak = useCallback((text, onEnd) => {
    const requestId = ++speechRequestRef.current;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.94;
    utter.pitch = 0.98;
    utter.volume = 1;

    const pickVoice = () => {
      const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
      return (
        voices.find((v) => v.lang.startsWith('en') && /(Aria|Ava|Jenny|Sonia|Neural|Natural)/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en') && /Google/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'))
      );
    };

    const voice = pickVoice();
    if (voice) utter.voice = voice;

    // Cancelling an earlier utterance can still trigger its event handlers in
    // some browsers. Only the newest request may continue the interview.
    utter.onstart = () => {
      if (requestId === speechRequestRef.current) setSpeaking(true);
    };
    utter.onend = () => {
      if (requestId !== speechRequestRef.current) return;
      setSpeaking(false);
      onEnd?.();
    };
    utter.onerror = () => {
      if (requestId !== speechRequestRef.current) return;
      setSpeaking(false);
      onEnd?.();
    };

    synth.speak(utter);
  }, []);

  const stopSpeaking = useCallback(() => {
    speechRequestRef.current += 1;
    synth.cancel();
    setSpeaking(false);
  }, []);

  const listen = useCallback((onResult, onEnd) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onEnd?.(''); return; }

    const previousRecognition = recognitionRef.current;
    if (previousRecognition) {
      previousRecognition.onresult = null;
      previousRecognition.onend = null;
      previousRecognition.onerror = null;
      try { previousRecognition.abort(); } catch { /* It may already be stopped. */ }
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let final = '';

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return;
      setListening(true);
      setTranscript('');
    };

    recognition.onresult = (e) => {
      if (recognitionRef.current !== recognition) return;
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim = t;
      }
      const combined = final + interim;
      setTranscript(combined);
      onResult?.(combined);
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setListening(false);
      onEnd?.(final.trim());
    };
    recognition.onerror = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setListening(false);
      onEnd?.(final.trim());
    };

    recognition.start();
  }, []);

  const stopListening = useCallback((onStopped) => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      onStopped?.();
      return;
    }
    if (onStopped) {
      const previousOnEnd = recognition.onend;
      let notified = false;
      const notifyStopped = () => {
        if (notified) return;
        notified = true;
        onStopped();
      };
      recognition.onend = (event) => {
        previousOnEnd?.(event);
        notifyStopped();
      };
      try {
        recognition.stop();
      } catch {
        notifyStopped();
      }
    } else {
      try {
        recognition.stop();
      } catch {
        // Recognition may already have stopped.
      }
    }
    setListening(false);
  }, []);

  const stopAll = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch { /* Recognition may already be stopped. */ }
      recognitionRef.current = null;
    }
    speechRequestRef.current += 1;
    synth.cancel();
    setListening(false);
    setSpeaking(false);
  }, [synth]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch { /* Recognition may already be stopped. */ }
      recognitionRef.current = null;
    }
    synth.cancel();
  }, [synth]);

  return { speaking, listening, transcript, speak, stopSpeaking, listen, stopListening, stopAll };
};
