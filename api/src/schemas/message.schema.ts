import { Schema, Document } from 'mongoose';

export const MessageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export interface Message extends Document {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
}
