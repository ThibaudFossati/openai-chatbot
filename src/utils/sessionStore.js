import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  messages: Array,
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);

export async function saveSession(sessionId, messages) {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Session.findOne({ sessionId });
  if (existing) {
    existing.messages = messages;
    await existing.save();
  } else {
    await Session.create({ sessionId, messages });
  }
}
