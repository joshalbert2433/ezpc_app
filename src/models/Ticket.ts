import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'user' | 'admin';
  text?: string;
  image?: string;
  seen?: boolean;
  createdAt: Date;
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  orderId?: mongoose.Types.ObjectId;
  category: 'technical' | 'shipping' | 'billing' | 'general';
  assignedTo?: mongoose.Types.ObjectId;
  assignedName?: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  messages: IMessage[];
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true, enum: ['user', 'admin'] },
  text: { type: String },
  image: { type: String },
  seen: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

const TicketSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    userName: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    category: { 
      type: String, 
      required: true, 
      default: 'general',
      enum: ['technical', 'shipping', 'billing', 'general']
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedName: { type: String },
    subject: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: 'open',
      enum: ['open', 'in-progress', 'closed'],
    },
    messages: [MessageSchema],
    internalNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
