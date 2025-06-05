import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello ! Pose-moi une question.' }
  ]);
  const [input, setInput] = useState('');

  async function handleSend() {
    if (!input.trim()) return;

    // 1) On ajoute d’abord le message utilisateur
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    const userInput = input.trim();
    setInput('');

    // 2) Puis on ajoute un placeholder “…thinking…”
    setMessages(prev => [...prev, { role: 'assistant', content: '…thinking…' }]);

    try {
      // 3) Envoi de la requête UNIQUEMENT au proxy local (/api/chat)
      const raw = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Vous êtes un assistant utile.' },
            ...messages,
            { role: 'user', content: userInput }
          ]
        })
      });

      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);

      // 4) Remplacer le placeholder par la réponse réelle
      const reply = data.choices?.[0]?.message?.content || '⚠️ Pas de réponse';
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: reply } : m
        )
      );
    } catch (err) {
      // 5) En cas d’erreur, on la remplace dans la bulle
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: '⚠️ ' + err.message }
            : m
        )
      );
    }
  }

  return (
    <div className="chat-container">
      <ul className="messages">
        {messages.map((m, i) => (
          <li key={i} className={m.role}>
            <strong>{m.role === 'user' ? 'Vous' : 'Bot'} : </strong>
            {m.content}
          </li>
        ))}
      </ul>
      <form
        className="input-area"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Écris ton message…"
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
