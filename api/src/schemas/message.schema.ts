import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true }) // Agrega automáticamente createdAt y updatedAt
export class Message {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversation_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  receiver_id?: string; // Kept for backward compatibility or specific direct messaging if needed, but conversation_id is preferred

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  // Message status
  @Prop({
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  })
  status: string;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  // Reply to message
  @Prop({
    type: {
      messageId: { type: MongooseSchema.Types.ObjectId, ref: 'Message' },
      content: String,
      senderName: String,
    },
    required: false,
  })
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };

  // Reactions
  @Prop({
    type: [
      {
        emoji: String,
        userId: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
        userName: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
    createdAt: Date;
  }>;
}

// 🔹 Combinamos el esquema con Mongoose Document
export type MessageDocument = Message & Document;

// 🔹 Generamos el esquema de Mongoose
export const MessageSchema = SchemaFactory.createForClass(Message);
