import React from 'react';
import { useSpeechRecognition } from '@react-speech-kit/webspeech';

export default function VoiceChat({ onTranscript }) {
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: result => {
      onTranscript(result)
    }
  });

  return (
    <div>
      <button onMouseDown={listen} onMouseUp={stop}>
        {listening ? 'Enregistrement...' : 'Parlez'}
      </button>
    </div>
  );
}
