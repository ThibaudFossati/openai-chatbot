import express from 'express';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { saveSession } from './src/utils/sessionStore.js';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Connecter MongoDB
mongoose.connect(process.env.MONGO_URI);

// Configurer OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Servir le build React
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// WebSocket : échange en temps réel
io.on('connection', socket => {
  socket.on('newUserSession', async ({ sessionId }) => {
    // Charger session depuis MongoDB si existante
    const Session = mongoose.model('Session');
    const existing = await Session.findOne({ sessionId });
    if (existing) {
      socket.emit('loadSession', existing.messages);
    }
  });

  socket.on('userMessage', async ({ sessionId, content }) => {
    // Récupérer historique depuis base
    const Session = mongoose.model('Session');
    let session = await Session.findOne({ sessionId });
    let messages = session ? session.messages : [];

    messages.push({ role: 'user', content });
    await saveSession(sessionId, messages);

    // Appeler OpenAI
    const response = await openai.createChatCompletion({
      model: 'gpt-4.1-nano',
      messages: [
        // system prompt à étoffer dans botConfig.js
        { role: 'system', content: 'Vous êtes InStories, un bot Ai Power Creative. Ton : professionnel Vous êtes InStories, un bot Ai Power Creative. Ton : professionnel Vous êtes InStories, un bot créatif IA… (instructions)…' }, clair (création, images Ai, luxe, mode, design) et amical Vous êtes InStories, un bot créatif IA… (instructions)…' }, créatif (humour subtil). Basez-vous sur instories.fr (services, workflows, philosophie). Pour toute question, reformulez très brièvement (15 mots max) et posez une question de suivi. clair (création, images Ai, luxe, mode, design) et amical Vous êtes InStories, un bot Ai Power Creative. Ton : professionnel Vous êtes InStories, un bot créatif IA… (instructions)…' }, clair (création, images Ai, luxe, mode, design) et amical Vous êtes InStories, un bot créatif IA… (instructions)…' }, créatif (humour subtil). Basez-vous sur instories.fr (services, workflows, philosophie). Pour toute question, reformulez très brièvement (15 mots max) et posez une question de suivi. créatif (humour subtil). Basez-vous sur instories.fr (services, workflows, philosophie). Pour toute question, reformulez très brièvement (15 mots max) et posez une question de suivi.
        ...messages
      ]
    });

    const reply = response.data.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });
    await saveSession(sessionId, messages);

    socket.emit('botMessage', reply);
  });
});

// Endpoint pour envoyer la session par email
app.post('/api/send-email', async (req, res) => {
  const { sessionId, recipient } = req.body;
  const Session = mongoose.model('Session');
  const session = await Session.findOne({ sessionId });
  if (!session) return res.status(400).json({ error: 'Session introuvable' });

  let emailBody = 'Conversation InStories Chatbot :\n\n';
  session.messages.forEach(m => {
    emailBody += ${m.role === 'user' ? 'Vous' : 'InStories'} : ${m.content}\n;
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: 'Conversation InStories Chatbot',
    text: emailBody
  });

  res.status(200).json({ status: 'Email envoyé' });
});

// Toutes les autres routes → index.html (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(\Serveur lancé sur http://localhost:${PORT}\);
});
