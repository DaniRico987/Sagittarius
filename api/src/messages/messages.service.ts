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
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      // Support both conversation_id and legacy direct messaging (optional)
      if (
        !createMessageDto.conversation_id &&
        (!createMessageDto.sender_id || !createMessageDto.receiver_id)
      ) {
        throw new Error('Falta conversation_id o sender/receiver');
      }

      // Check friendship for 1-on-1 conversations
      if (createMessageDto.conversation_id) {
        const conversation = await this.conversationModel.findById(
          createMessageDto.conversation_id,
        );
        if (conversation && !conversation.isGroup) {
          const senderId = createMessageDto.sender_id;
          // Find the other participant
          const otherParticipantId = conversation.participants.find(
            (p) => p.toString() !== senderId.toString(),
          );

          if (otherParticipantId) {
            const sender = await this.userModel.findById(senderId);
            if (sender && !sender.friends.includes(otherParticipantId)) {
              throw new Error(
                'No puedes enviar mensajes a este usuario porque no son amigos.',
              );
            }
          }
        }
      }

      const newMessage = new this.messageModel(createMessageDto);
      const savedMessage = await newMessage.save();

      // Update last message in conversation
      if (createMessageDto.conversation_id) {
        await this.conversationModel.findByIdAndUpdate(
          createMessageDto.conversation_id,
          {
            lastMessage: savedMessage._id,
          },
        );
      }

      return savedMessage;
    } catch (error) {
      console.error('❌ Error al guardar el mensaje:', error.message);
      throw new Error(`Error al guardar el mensaje: ${error.message}`);
    }
  }

  async createConversation(
    name: string,
    participants: string[],
    isGroup: boolean,
    admins: string[] = [],
  ): Promise<Conversation> {
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
  async getConversation(
    userId: string,
    receiverId: string,
  ): Promise<Message[]> {
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

  // Mark messages as delivered
  async markAsDelivered(messageIds: string[]): Promise<void> {
    await this.messageModel.updateMany(
      { _id: { $in: messageIds }, status: 'sent' },
      {
        status: 'delivered',
        deliveredAt: new Date(),
      },
    );
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<Message[]> {
    const messages = await this.messageModel.find({
      conversation_id: conversationId,
      sender_id: { $ne: userId },
      status: { $in: ['sent', 'delivered'] },
    });

    await this.messageModel.updateMany(
      {
        conversation_id: conversationId,
        sender_id: { $ne: userId },
        status: { $in: ['sent', 'delivered'] },
      },
      {
        status: 'read',
        readAt: new Date(),
      },
    );

    return messages;
  }

  // Toggle reaction on a message
  async toggleReaction(
    messageId: string,
    userId: string,
    userName: string,
    emoji: string,
  ): Promise<Message> {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new Error('Mensaje no encontrado');
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.emoji === emoji,
    );

    if (existingReactionIndex > -1) {
      // Remove reaction if already exists
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({
        emoji,
        userId: userId as any,
        userName,
        createdAt: new Date(),
      });
    }

    return await message.save();
  }

  // Increment unread count for all participants except sender
  async incrementUnreadCount(
    conversationId: string,
    senderId: string,
  ): Promise<Conversation | null> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) return null;

    const unreadCount = conversation.unreadCount || new Map();

    // Increment count for all participants except sender
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== senderId.toString()) {
        const currentCount = unreadCount.get(participantId.toString()) || 0;
        unreadCount.set(participantId.toString(), currentCount + 1);
      }
    }

    const updated = await this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        unreadCount: Object.fromEntries(unreadCount),
      },
      { new: true },
    );

    return updated;
  }

  // Clear unread count for a user in a conversation
  async clearUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) return;

    const unreadCount = conversation.unreadCount || new Map();
    unreadCount.set(userId, 0);

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      unreadCount: Object.fromEntries(unreadCount),
    });
  }
}
