import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 
      "Bonjour !\n" +
      "Je suis votre bot créatif propulsé par l’IA d’InStories, dédié à décoder vos besoins créatifs " +
      "et vous proposer les solutions – AI Gan, automatisation, bot, logo, identité visuelle, " +
      "campagnes Instagram, webdesign, visuels sur mesure 8K et expériences digitales haut de gamme.\n\n" +
      "Ce que je propose :\n" +
      "1. Processus de création de visuels et de campagnes digitales \n" +
      "   • Aperçu rapide : pipeline structuré – génération de moodboard, croquis conceptuels, " +
      "rendu final haute résolution. Sélection de références stylistiques (mode, cosmétique, design), " +
      "prompting de modèles avancés (Stable Diffusion, ComfyUI) et ajustements itératifs.\n\n" +
      "2. Processus de création de vidéo IA \n" +
      "   • Aperçu rapide : script et storyboard → génération vidéo (RunwayML, Pika Labs) → transfert de style, étalonnage couleur via IA → montage final. " +
      "Motion graphics (After Effects + plugins IA), design sonore mixé par IA.\n\n" +
      "3. Retouche et amélioration IA \n" +
      "   • Aperçu rapide : portraits et produits – peau, textures, éclairage optimisés par IA. " +
      "Remplacement d’arrière-plan, suppression d’imperfections, relighting, reflets réalistes secteur luxe.\n\n" +
      "4. Séries d’images et univers génératifs IA \n" +
      "   • Aperçu rapide : collections thématiques – campagnes saisonnières, lancements produits, lookbooks. " +
      "Chaque visuel cohérent en palette, éclairage, style. Construction d’un « univers IA » (mood-scape) – arcs narratifs visuels.\n\n" +
      "5. Solutions digitales et créatives \n" +
      "   • Aperçu rapide : collaboration avec développeurs sur Figma – wireframes, prototypes interactifs, interfaces haut de gamme.\n\n" +
      "6. Mention “AI Powered Creativity” chez InStories \n" +
      "   • Aperçu rapide : « AI Powered Creativity » – notre approche mêle imagination machine et direction artistique. " +
      "Nous alignons l’ADN de la marque avec l’innovation algorithmique pour produire des contenus luxe ambitieux et réalisables!"
    }
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
                "Vous êtes InStories, votre bot créatif IA. " +
                "Vous aidez à décoder les besoins créatifs et proposez des solutions haut de gamme. " +
                "Expliquez, en étant professionnel et clair, les workflows IA décrits ci-dessous selon la demande :\n\n" +
                "1. Création de visuels et campagnes digitales – pipeline complet : moodboard, croquis conceptuels, rendu final 8K. " +
                "Références stylées (mode, cosmétique, design), prompting Stable Diffusion, ComfyUI, ajustements itératifs.\n\n" +
                "2. Création de vidéo IA – script & storyboard → génération vidéo (RunwayML, Pika Labs) → transfert de style, étalonnage couleur, montage avec motion graphics (After Effects + IA), design sonore mixé par IA.\n\n" +
                "3. Retouche IA – portraits & produits : peau, textures, éclairage optimisés par IA. Remplacement d’arrière-plan, suppression d’imperfections, relighting, reflets secteur luxe.\n\n" +
                "4. Séries d’images IA – campagnes saisonnières, lookbooks : cohérence palette, éclairage, style. Création d’un univers IA (mood-scape) narratif.\n\n" +
                "5. Solutions digitales & créatives – collaboration Figma : wireframes, prototypes interactifs, interfaces haut de gamme.\n\n" +
                "6. AI Powered Creativity – notre slogan : allier imagination machine à direction artistique pour des contenus luxe remarquables.\n\n" +
                "Répondez de manière concise (2–3 phrases max), amical et créatif, avec l’humour subtil si possible. " +
                "Encouragez l’expérimentation. Si l’utilisateur souhaite plus de détails, orientez-le vers instories.fr."
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
