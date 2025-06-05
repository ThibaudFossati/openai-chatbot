const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

require('dotenv').config();  // charge OPENAI_API_KEY depuis .env

const app = express();
app.use(cors());
app.use(express.json());

// 1) Sert le dossier build de React en statique
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// 2) Endpoint /api/chat qui transmet la requête à l’API OpenAI
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

// 3) Catch-all : pour toute autre route, renvoyer index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// 4) Démarrage du serveur
const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Server listening on port', port));
