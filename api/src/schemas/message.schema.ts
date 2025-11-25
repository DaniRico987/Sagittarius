import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true }) // Agrega automáticamente createdAt y updatedAt
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Conversation', required: true })
  conversation_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  receiver_id?: string; // Kept for backward compatibility or specific direct messaging if needed, but conversation_id is preferred

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

// 🔹 Combinamos el esquema con Mongoose Document
export type MessageDocument = Message & Document;

// 🔹 Generamos el esquema de Mongoose
export const MessageSchema = SchemaFactory.createForClass(Message);
