import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
  @Prop()
  name?: string; // Optional for direct chats

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  admins: string[]; // Only for groups

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  lastMessage?: string;
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
