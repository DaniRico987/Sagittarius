import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { Conversation } from '../schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private messageModel: Model<Message>,
    @InjectModel('Conversation') private conversationModel: Model<Conversation>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      // Support both conversation_id and legacy direct messaging (optional)
      if (!createMessageDto.conversation_id && (!createMessageDto.sender_id || !createMessageDto.receiver_id)) {
         throw new Error('Falta conversation_id o sender/receiver');
      }

      const newMessage = new this.messageModel(createMessageDto);
      const savedMessage = await newMessage.save();

      // Update last message in conversation
      if (createMessageDto.conversation_id) {
        await this.conversationModel.findByIdAndUpdate(createMessageDto.conversation_id, {
          lastMessage: savedMessage._id,
        });
      }

      return savedMessage;
    } catch (error) {
      console.error('❌ Error al guardar el mensaje:', error.message);
      throw new Error(`Error al guardar el mensaje: ${error.message}`);
    }
  }

  async createConversation(name: string, participants: string[], isGroup: boolean, admins: string[] = []): Promise<Conversation> {
    const newConversation = new this.conversationModel({
      name,
      participants,
      isGroup,
      admins,
    });
    return await newConversation.save();
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await this.messageModel
      .find({ conversation_id: conversationId })
      .populate('sender_id', 'name avatar')
      .sort({ timestamp: 1 })
      .exec();
  }

  // Legacy support or direct chat lookup
  async getConversation(userId: string, receiverId: string): Promise<Message[]> {
    // ... existing logic if needed, or redirect to getMessagesByConversation if we find a conversation
    // For now keeping it as is but it might be better to find the conversation between these two
    return await this.messageModel
        .find({
          $or: [
            { sender_id: userId, receiver_id: receiverId },
            { sender_id: receiverId, receiver_id: userId },
          ],
        })
        .sort({ timestamp: 1 })
        .exec();
  }
}
