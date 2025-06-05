const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// 1) Charger .env en priorité (pour que process.env.OPENAI_API_KEY soit défini en local)
require('dotenv').config();

// 2) Afficher la clé une fois dotenv chargé
console.log("🔑 PROD – OPENAI_API_KEY =", process.env.OPENAI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Sert le dossier build de React en statique
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Endpoint /api/chat qui transmet la requête à l’API OpenAI
app.post('/api/chat', async (req, res) => {
  const { messages, model = 'gpt-3.5-turbo' } = req.body;
  try {
    const raw = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({ model, messages })
    });
    const data = await raw.json();
    return res.status(raw.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
});

// Catch-all : pour toute route non-API, renvoyer index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Démarrage du serveur
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Server listening on port', port));
