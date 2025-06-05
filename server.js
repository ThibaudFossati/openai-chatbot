const express = require('express');
const cors    = require('cors');
const fetch   = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

require('dotenv').config();                                   // charge .env
console.log('🔑 KEY LOADED →', process.env.OPENAI_API_KEY?.slice(0,12), '...');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages, model = 'gpt-3.5-turbo' } = req.body;
  try {
    const raw  = await fetch('https://api.openai.com/v1/chat/completions', {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization : `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model, messages })
    });
    const data = await raw.json();
    res.status(raw.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('Proxy listening on', port));
