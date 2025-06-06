import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import VoiceChat from './components/VoiceChat/VoiceChat';
import ImageAnalyzer from './components/ImageAnalyzer/ImageAnalyzer';
import PortfolioCarousel from './components/PortfolioCarousel/PortfolioCarousel';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:10000');

export default function App() {
  const [sessionId] = useState(() => Date.now().toString());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    // Initialiser la session sur le serveur
    socket.emit('newUserSession', { sessionId });
    socket.on('loadSession', savedMessages => {
      setMessages(savedMessages);
    });
    socket.on('botMessage', reply => {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    });
    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    socket.emit('userMessage', { sessionId, content });
  }

  function handleTranscript(text) {
    setInput(text);
    // Lancer l’envoi automatique si vous le souhaitez :
    // handleSend(new Event('submit'));
  }

  function handleAnalyzeImage(imageFile) {
    // Exemple : ajouter à l’historique un message de type image uploadée
    const url = URL.createObjectURL(imageFile);
    setMessages(prev => [...prev, { role: 'user', content: `[Image: ${imageFile.name}]` }]);
    // Placeholder : on pourrait émettre un event socket pour analyser l’image
  }

  // Exemple d’items pour le carrousel (à remplacer dynamiquement)
  useEffect(() => {
    setCarouselItems([
      { src: '/examples/moodboard1.jpg', alt: 'Moodboard Mode', caption: 'Moodboard Fashion' },
      { src: '/examples/moodboard2.jpg', alt: 'Moodboard Luxe', caption: 'Moodboard Luxe' }
    ]);
  }, []);

  async function handleEmail() {
    try {
      const raw = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, recipient: 'contact@instories.fr' })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);
      toast.success('Email envoyé avec succès !', { position: 'top-right' });
    } catch (err) {
      toast.error('Erreur : ' + err.message, { position: 'top-right' });
    }
  }

  return (
    <div className="app-wrapper">
      <PortfolioCarousel items={carouselItems} />

      <div className="chat-container">
        <ul className="messages">
          {messages.map((m, i) => (
            <li key={i} className={m.role}>
              <strong>{m.role === 'user' ? 'Vous' : 'InStories'} : </strong>
              {m.content}
              {m.role === 'assistant' && loading && i === messages.length - 1 && (
                <span className="spinner">
                  <ClipLoader size={15} />
                </span>
              )}
            </li>
          ))}
        </ul>

        <VoiceChat onTranscript={handleTranscript} />

        <ImageAnalyzer onAnalyze={handleAnalyzeImage} />

        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          <button
            onClick={handleEmail}
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Contactez-nous
          </button>
        </div>

        <form className="input-area" onSubmit={handleSend}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
            style={{ lineHeight: 1.6 }}
          />
          <button type="submit">Envoyer</button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
