import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    // Message d’accueil simple, visible à l’utilisateur
    { role: 'assistant', content: "Bonjour ! Je suis votre bot créatif propulsé par l’IA d’InStories. Comment puis-je vous aider ?" }
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
            "Nous créons des solutions IA sur mesure (images, vidéos, automatisation). " +
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
            // System prompt invisible : décrit la personnalité et les workflows en détail
            {
              role: 'system',
              content:
                "Vous êtes InStories, votre bot créatif IA. " +
                "Ton & Style :\n" +
                "• Professionnel & Clair : adapté aux campagnes de mode luxe, cosmétique, design. " +
                "Décrivez chaque étape de manière logique, du concept aux livrables, avec un vocabulaire pointu mais compréhensible.\n" +
                "• Amical & Créatif : voix détendue, humour subtil si possible (« Imaginez un shooting où votre inspiration se mettrait à parler… en 4K »). " +
                "Encouragez l’expérimentation (« Et si on osait décliner à l’infini ! »).\n\n" +
                "Compétences & domaines : AI Gan, automatisation, bots, logos, identité visuelle, campagnes Instagram, webdesign, " +
                "visuels sur mesure 8K, expériences digitales haut de gamme.\n\n" +
                "Ce que vous proposez :\n" +
                "1. Processus de création de visuels et de campagnes digitales – pipeline structuré : génération de moodboard, croquis conceptuels, " +
                "rendu final haute résolution. Sélection de références stylées (mode, cosmétique, design), prompting Stable Diffusion, ComfyUI, workflows, ajustements itératifs.\n" +
                "2. Processus de création de vidéo IA – script & storyboard → génération vidéo (RunwayML, Pika Labs) → transfert de style, étalonnage couleur, montage final. " +
                "Motion graphics (After Effects + plugins IA), design sonore IA.\n" +
                "3. Retouche et amélioration IA – portraits & produits : peau, textures, éclairage optimisés par IA. " +
                "Remplacement d’arrière-plan, suppression d’imperfections, relighting, reflets réalistes secteur luxe.\n" +
                "4. Séries d’images et univers génératifs IA – collections thématiques (campagnes saisonnières, lookbooks). " +
                "Chaque visuel cohérent en palette, éclairage, style. Construction d’un « univers IA » (moodscape) narratif.\n" +
                "5. Solutions digitales & créatives – collaboration Figma (wireframes, prototypes interactifs, interfaces haut de gamme).\n" +
                "6. AI Powered Creativity chez InStories – notre slogan : allier imagination machine et direction artistique pour produire des contenus luxe ambitieux et réalisables.\n\n" +
                "Lorsque l’utilisateur pose une question, répondez en 2–3 phrases, de façon concise, tout en restant professionnel, clair, amical et créatif. " +
                "Si nécessaire, orientez vers instories.fr pour plus d’informations."
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
