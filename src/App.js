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
  const [emailStatus, setEmailStatus] = useState(''); // pour feedback envoi email

  async function handleSend() {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setInput('');

    // Détection d'une demande de devis ou projet : proposer forfait semaine / devis long terme
    const texte = userInput.toLowerCase();
    const motsForfait = ['forfait', 'semaine', 'abonnement'];
    if (motsForfait.some(mot => texte.includes(mot))) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Nous proposons un forfait à la journée ou la semaine et un devis sur mesure pour une collaboration long terme. " +
            "Pour plus de détails ou pour passer commande, cliquez sur le bouton “Contactez-nous” ci-dessous."
        }
      ]);
      return;
    }

    // Détection d'une demande de devis sur le long terme
    const motsDevis = ['devis', 'projet', 'tarif', 'coût', 'prix', 'estimation'];
    if (motsDevis.some(mot => texte.includes(mot))) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Pour un devis sur mesure ou une prestation long terme, cliquez sur le bouton “Contactez-nous” ci-dessous, " +
            "et nous vous enverrons un email récapitulatif de notre conversation."
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
                "Vous êtes InStories, un bot créatif IA. Répondez aux questions en vous appuyant " +
                "sur les éléments du site https://instories.fr : services, philosophie. " +
                "Posez des questions de suivi pour mieux comprendre le projet avant de proposer une solution. " +
                "Restez professionnel, clair, amical et créatif."
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

  // Fonction pour envoyer la conversation par email
  async function handleEmail() {
    try {
      const recipient = 'contact@instories.fr';
      const raw = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, recipient })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);
      setEmailStatus('Email envoyé avec succès !');
    } catch (err) {
      setEmailStatus('Erreur en envoyant l’email : ' + err.message);
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

        {/* Bouton Contactez-nous sous le chat */}
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
          {emailStatus && (
            <div style={{ marginTop: '8px', color: '#333' }}>{emailStatus}</div>
          )}
        </div>

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
