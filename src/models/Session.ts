import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userAgent: { type: String },
  ip: { type: String },
  lastActive: { type: Date, default: Date.now },
  isCurrent: { type: Boolean, default: false }, // Virtual or managed via middleware
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
