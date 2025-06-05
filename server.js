const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

//  ⚠️ On affiche la valeur de OPENAI_API_KEY au démarrage (pour debug)
console.log("🔑 PROD – OPENAI_API_KEY =", process.env.OPENAI_API_KEY);

require('dotenv').config();  // charge .env en local, sur Render ce sera ignoré

const app = express();
app.use(cors());
app.use(express.json());

// Sert le dossier build/ de React
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Endpoint /api/chat
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

// Catch-all : renvoyer index.html pour toutes les routes non-API
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Démarrage du serveur
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Server listening on port', port));
