import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'Logged In', 'Order Placed', 'Profile Updated'
  details: { type: String },
  ip: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
