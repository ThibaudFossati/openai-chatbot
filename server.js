import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques de React
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Endpoint pour la conversation vers OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer \${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// Endpoint pour envoyer la conversation par email
app.post('/api/send-email', async (req, res) => {
  try {
    const { messages, recipient } = req.body;
    if (!recipient) {
      return res.status(400).json({ error: 'Destinataire manquant' });
    }
    // Construire le corps de l'email avec la conversation
    let emailBody = 'Conversation InStories Chatbot :\n\n';
    messages.forEach(m => {
      emailBody += \`\${m.role === 'user' ? 'Vous' : 'InStories'} : \${m.content}\n\`;
    });

    // Configurer nodemailer avec votre compte SMTP (exemple Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,      // ajouter dans Render : SMTP_USER (ex. votre.email@gmail.com)
        pass: process.env.SMTP_PASSWORD,  // ajouter dans Render : SMTP_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipient,
      subject: 'Conversation InStories Chatbot',
      text: emailBody,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ status: 'Email envoyé' });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// Toutes les autres routes vers index.html (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});
