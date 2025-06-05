import React, { useState } from 'react';
import './App.css';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider ?' }
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
    const estDevis = motsDevis.some(mot => texte.includes(mot));

    if (estDevis) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 
            "Nous sommes en mesure de travailler sur des programmes d’IA comme celui-ci, ou de créer des solutions sur mesure pour la génération d’images et de vidéos en IA. " +
            "Nous avons notamment collaboré avec L’Oréal, Ogilvy Paris et Nespresso sur des campagnes internationales. " +
            "Pour toute demande de devis ou projet, veuillez envoyer un e-mail à contact@instories.fr."
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
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 
                "Vous êtes InStories, expert en création de contenu et campagne de luxe. Voici quelques références clés :\n" +
                "1. SQUARE Geneva (WEB Design) – English: Art direction and complete design of a modeling website for SQUARE Geneva. Company: Square groupe. Technology: Figma, After Effect. Français: Direction artistique et design complet pour SQUARE Geneva. Entreprise : Square groupe. Technologies : Figma, After Effect.\n\n" +
                "2. Shiseido “Boost Friday” (DREAMLIKE REALISM) – English: Artistic direction and design for Shiseido’s internal program “Boost Friday,” dreamlike visuals blending hyperrealistic photography with minimalist illustration. Company: Shiseido. Technology: Figma, ComfyUI, Automatic1111. Français: Direction artistique pour “Boost Friday” de Shiseido. Entreprise : Shiseido. Technologies : Figma, ComfyUI, Automatic1111.\n\n" +
                "3. AI-Powered Creativity (XP Clients) – English: Clients: MenExpert, Lancôme, Nespresso, Vichy, La Samaritaine, Hugo Boss, Lancaster. Français: Clients sélectionnés : MenExpert, Lancôme, Nespresso, Vichy, La Samaritaine, Hugo Boss, Lancaster.\n\n" +
                "4. L’Oréal – Creaitech Platform (Design & AI) – English: Design of a unified platform for all L’Oréal brands via Creaitech. Company: L’Oréal groupe. Technology: Figma, LoRa, Automatic1111. Français: Conception d’une plateforme unifiée pour L’Oréal via Creaitech. Entreprise : L’Oréal groupe. Technologies : Figma, LoRa, Automatic1111.\n\n" +
                "5. Nespresso × Fusalp (Taste The Winter Wonder) – English: Production of the 2023 festive campaign “Taste The Winter Wonder” for Nespresso. Agency: Ogilvy UK. Technology: Automatic1111, MidJourney, Photoshop. Français: Création de la campagne festive 2023 “Taste The Winter Wonder” pour Nespresso. Agence : Ogilvy UK. Technologies : Automatic1111, MidJourney, Photoshop.\n\n" +
                "6. The Art of Dynamic Sports Design – English: Carousels to Stories aligned with website identity for only-one-agency. Technology: After Effect, Illustrator. Français: Chaque élément (carrousels, Stories) aligné visuellement pour only-one-agency. Lien : https://only-one-agency.com. Technologies : After Effect, Illustrator.\n\n" +
                "7. Meetic – “Time Fades Away… That’s Meetic” – English: Campaign capturing a film essence in one AI-generated image: “The Endless Love.” Agency: Rosa Paris. Technology: Automatic1111, Photoshop. Français: Campagne Meetic “The Endless Love”. Agence : Rosa Paris. Technologies : Automatic1111, Photoshop.\n\n" +
                "8. Salomon – “Tomorrow Is Yours” (Trail Campaign) – English: Art direction for Salomon’s trail category on social media and flagship channels. Agency: DDB Paris. Technology: Automatic1111. Français: Direction artistique pour “Tomorrow Is Yours” de Salomon. Agence : DDB Paris. Technologie : Automatic1111.\n\n" +
                "9. Renault – “Twingo Challenge” – English: AI creation for Renault #Twingo30 contest by Patrice Meignan. Company: Renault Twingo. Technology: MidJourney (seed). Français: Création IA concours Renault #Twingo30. Entreprise : Renault Twingo. Technologie : MidJourney (seed).\n\n" +
                "10. Motion Design (Team Building Creator) – English: Motion design for Team Building Creator website. Agency: Harmony Magic. Technology: After Effect, Illustrator. Lien : https://harmonymagic.com. Français: Motion design pour Team Building Creator. Agence : Harmony Magic. Technologies : After Effect, Illustrator.\n\n" +
                "11. Vector Illustrations – “Out of Office!” – English: Personal vector project “Out of Office!”. Technology: Illustrator AI. Français: Illustrations vectorielles “Out of Office !”. Technologie : Illustrator AI.\n\n" +
                "12. Print – VW ID.Buzz Electric (Ghost Campaign) – English: Print campaign homage to VW’s legendary van. Technology: MidJourney V5, Photoshop. Français: Campagne print VW ID.Buzz Electric. Technologies : MidJourney V5, Photoshop.\n\n" +
                "13. Kinder – “Marronnier Calendar” – English: Team collaboration and artistic supervision for Kinder’s Instagram/Facebook calendar. Agency: Publicis Consultants. Français: Collaboration et supervision artistique pour Kinder. Agence : Publicis Consultants.\n\n" +
                "14. Instagram Presence (“in stagram”) – English: Instagram showcases of AI-powered creativity. Lien : https://instagram.com. Français: Publications Instagram AI. Exemples : plusieurs comptes.\n\n" +
                "15. Personal Work – AI-Infused Laboratory – English: Personal portfolio with AI creative experiments. Liens : Instagram, Behance, Facebook, TikTok, LinkedIn. Français: Portfolio personnel AI. Liens : Instagram, Behance, Facebook, TikTok, LinkedIn.\n\n" +
                "16. Research Lab (da.instories.fr) – English: Dedicated “Research Lab” subdomain for R&D on AI-driven creativity. Lien : https://da.instories.fr. Français: Sous-domaine R&D AI. Lien : https://da.instories.fr.\n\n" +
                "Répondez de manière concise, engageante et professionnelle, et orientez toujours vers instories.fr pour plus d’informations."
            },
            ...messages,
            { role: 'user', content: userInput }
          ]
        })
      });
      const data = await raw.json();
      if (!raw.ok) throw new Error(data.error?.message || raw.statusText);

      const reply = data.choices?.[0]?.message?.content || '⚠️ Pas de réponse';
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
