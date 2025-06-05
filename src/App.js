import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    // Message d’accueil simple
    { role: 'assistant', content: "Bonjour ! Je suis votre bot créatif InStories. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');

    // Détection d'une demande de devis ou projet
    const texte = userInput.toLowerCase();
    const motsDevis = ['devis', 'projet', 'tarif', 'coût', 'prix', 'estimation'];
    if (motsDevis.some(mot => texte.includes(mot))) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Nous réalisons des solutions IA sur mesure (images, vidéos, automatisation). " +
            "Pour un devis ou projet, envoyez un email à contact@instories.fr."
        }
      ]);
      return;
    }

    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const raw = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content:
                "Vous êtes InStories, un bot créatif IA spécialisé dans les projets de luxe, mode et design. " +
                "Votre rôle : engager une discussion autour du projet créatif. Posez des questions pertinentes pour comprendre " +
                "les objectifs, l’identité visuelle et les besoins du client. Restez professionnel, clair, amical et créatif. " +
                "Évitez de proposer immédiatement des idées préfabriquées. Cherchez d’abord à en savoir plus sur le contexte."
            },
            ...messages,
            { role: 'user', content: userInput }
          ]
        })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);

      const reply = data.choices?.[0]?.message?.content.trim() || '⚠️ Pas de réponse';
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: reply } : m
        )
      );
    } catch (err) {
      toast.error('Erreur : ' + err.message, { position: 'top-right' });
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: '⚠️ ' + err.message }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-wrapper">
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
        <form className="input-area" onSubmit={e => { e.preventDefault(); handleSend(); }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Écrivez votre message…"
          />
          <button type="submit">Envoyer</button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}
