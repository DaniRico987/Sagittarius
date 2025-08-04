import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      if (!createMessageDto.sender_id || !createMessageDto.receiver_id || !createMessageDto.content) {
        throw new Error('Datos del mensaje incompletos');
      }
      
      const newMessage = new this.messageModel(createMessageDto);
      return await newMessage.save();
    } catch (error) {
      console.error('❌ Error al guardar el mensaje:', error.message);
      throw new Error(`Error al guardar el mensaje: ${error.message}`);
    }
  }

  async getConversation(userId: string, receiverId: string): Promise<Message[]> {
    try {
      if (!userId || !receiverId) {
        throw new Error('IDs de usuario inválidos');
      }
      
      return await this.messageModel
        .find({
          $or: [
            { sender_id: userId, receiver_id: receiverId },
            { sender_id: receiverId, receiver_id: userId },
          ],
        })
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      console.error('❌ Error al obtener la conversación:', error.message);
      throw new Error(`Error al obtener la conversación: ${error.message}`);
    }
  }
}
