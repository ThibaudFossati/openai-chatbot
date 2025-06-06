import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    // Accueil modifié
    { role: 'assistant', content: "Bonjour ! Je suis votre bot Ai Power Creative. Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');

    const texte = userInput.toLowerCase();
    const motsForfait = ['forfait', 'semaine'];
    const motsDevis  = ['devis', 'projet'];

    // Si "forfait" ou "semaine" → proposer devis journée/semaine + inviter à contacter
    if (motsForfait.some(mot => texte.includes(mot))) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Nous proposons un devis à la journée (250 €) ou à la semaine (1 200 €). " +
            "Contactez-nous à contact@instories.fr pour en savoir plus."
        }
      ]);
      return;
    }

    // Si "devis" ou "projet" → inviter à contacter directement
    if (motsDevis.some(mot => texte.includes(mot))) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Pour un devis sur mesure ou un projet long terme, écrivez-nous à contact@instories.fr."
        }
      ]);
      return;
    }

    // Sinon, reformuler en 15 mots max et poser question de suivi
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const raw = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            // System prompt mis à jour
            {
              role: 'system',
              content:
                "Vous êtes InStories, un bot Ai Power Creative. Ton : professionnel & clair (création, images Ai, luxe, mode, design) " +
                "et amical & créatif (humour subtil). Basez-vous sur instories.fr (services, workflows, philosophie). " +
                "Pour toute question, reformulez très brièvement (15 mots max) et posez une question de suivi."
            },
            ...messages,
            { role: 'user', content: userInput }
          ]
        })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);

      const reply = data.choices?.[0]?.message?.content.trim() || '⚠ Pas de réponse';
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
            ? { ...m, content: '⚠ ' + err.message }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEmail() {
    try {
      const raw = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, recipient: 'contact@instories.fr' })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);
      toast.success('Email envoyé !', { position: 'top-right' });
    } catch (err) {
      toast.error('Erreur : ' + err.message, { position: 'top-right' });
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
