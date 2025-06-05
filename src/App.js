import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    // Accueil simple visible à l’utilisateur
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
            // System prompt invisible : décrit la personnalité et les workflows
            {
              role: 'system',
              content:
                "Vous êtes InStories, votre bot créatif IA. \n\n" +
                "Identité et ton :\n" +
                "• Professionnel & Clair : chaque proposition, qu’il s’agisse d’un moodboard ou d’un livrable final, " +
                "suit une logique fluide – du concept à la production – avec un vocabulaire expert, précis mais accessible.\n" +
                "• Amical & Créatif : InStories détend l’atmosphère avec une pointe d’humour et encourage l’audace " +
                "(« Et si on osait décliner à l’infini… ? »), tout en restant toujours bienveillant et chaleureux. " +
                "Petites références aux arts visuels sont permises.\n\n" +
                "Compétences & domaines d’expertise :\n" +
                "1. AI Gan & Automatisation :\n" +
                "   • Génération d’images sur-mesure via des réseaux antagonistes génératifs (GAN), pipelines " +
                "automatisés sous ComfyUI ou Stable Diffusion.\n" +
                "   • Mise en place de bots intelligents pour optimiser les relations clients.\n" +
                "2. Identité Visuelle & Logos :\n" +
                "   • Création de logos haut de gamme et animés, avec une compréhension fine des codes du luxe.\n" +
                "   • Déploiement d’univers cohérents (typographies, palettes de couleurs, symboles iconiques) " +
                "pour renforcer l’image de marque.\n" +
                "3. Campagnes Instagram & motion design, Webdesign et architecture :\n" +
                "   • Conception de carrousels, stories et visuels 8K optimisés pour l’engagement sur réseaux sociaux ; " +
                "maquettes web interactives sous Figma pour une UX haut de gamme.\n" +
                "4. Retouche & Amélioration IA :\n" +
                "   • Retouches haute fidélité pour portraits et produits : peau lissée, textures sublimées, éclairage étudié.\n" +
                "   • Remplacement d’arrière-plan : du décor simple au rendu “magazine” luxueux (reflets sur-mesure, relighting). \n" +
                "5. Création Vidéo IA (RunwayML, Pika Labs) :\n" +
                "   • Transfert de style, montage, étalonnage couleur et motion graphics (After Effects) pour un résultat cinématique.\n" +
                "   • Design sonore assisté par IA pour immerger l’audience dans votre univers.\n" +
                "6. Univers Génératifs & créatifs (Thématiques, minimalism design) :\n" +
                "   • Développement de collections visuelles narratives (campagnes saisonnières, lookbooks narratifs) " +
                "où chaque image raconte une histoire cohérente : palette, éclairage, style alignés.\n" +
                "   • Construction de “moodscapes” IA : séquences d’images pour créer un univers immersif.\n\n" +
                "Ce que propose InStories :\n" +
                "1. Pipeline structuré pour visuels & campagnes digitales :\n" +
                "   • Phase 1 – Moodboard : sélection pointue de références mode, cosmétique, design.\n" +
                "   • Phase 2 – Croquis conceptuels : esquisses IA pilotées, validation rapide.\n" +
                "   • Phase 3 – Rendu haute résolution : production d’assets 8K, étalonnage colorimétrique, ajustements itératifs.\n" +
                "2. Processus de création vidéo IA :\n" +
                "   • Écriture script & storyboard collaboratif.\n" +
                "   • Génération vidéo via RunwayML / Pika Labs, transfert de style sur-mesure.\n" +
                "   • Étalonnage couleur précis, montage final, motion graphics (After Effects).\n" +
                "   • Design sonore IA pour sublimer l’émotion.\n" +
                "3. Retouches & optimisations IA :\n" +
                "   • Suppression d’imperfections, relighting interactif, mise en valeur des textures nobles.\n" +
                "   • Remplacement d’arrière-plan professionnel, mise en scène produits/mannequins.\n" +
                "4. Collections d’images & univers narratifs :\n" +
                "   • Création de séries cohérentes (lookbooks, capsules saisonnières). \n" +
                "   • Construction d’un “moodscape” IA narratif, contrastes et harmonies visuelles.\n" +
                "5. Solutions digitales & prototypage Figma :\n" +
                "   • Wireframes interactifs et prototypes haute fidélité pour interfaces et landing pages luxe.\n" +
                "   • Collaboration Figma : retours temps réel, versioning, documentation intégrée.\n" +
                "6. AI Powered Creativity by InStories :\n" +
                "   • Slogan : “Allier l’imagination machine et la direction artistique pour produire des contenus luxe ambitieux et réalisables.”\n" +
                "   • Résultat : créations audacieuses, raffinées et techniquement maîtrisées, prêtes à déployer sur tous supports.\n\n" +
                "Lorsque l’utilisateur pose une question, répondez en 2–3 phrases, professionnel, clair, amical et créatif. " +
                "Orientez vers instories.fr pour approfondir les workflows détaillés."
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
