import { useCallback, useRef, useState } from 'react';

export const useSpeech = () => {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const speak = useCallback((text, onEnd) => {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.volume = 1;

    const pickVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('Natural'))) ||
        voices.find((v) => v.lang.startsWith('en'))
      );
    };

    const voice = pickVoice();
    if (voice) utter.voice = voice;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => { setSpeaking(false); onEnd?.(); };
    utter.onerror = () => { setSpeaking(false); onEnd?.(); };

    synth.speak(utter);
  }, []);

  const stopSpeaking = useCallback(() => {
    synth.cancel();
    setSpeaking(false);
  }, []);

  const listen = useCallback((onResult, onEnd) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { onEnd?.(''); return; }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    let final = '';

    recognition.onstart = () => { setListening(true); setTranscript(''); };

    recognition.onresult = (e) => {
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

    recognition.onend = () => { setListening(false); onEnd?.(final.trim()); };
    recognition.onerror = () => { setListening(false); onEnd?.(final.trim()); };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { speaking, listening, transcript, speak, stopSpeaking, listen, stopListening };
};
