import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel({
      ...createMessageDto,
      timestamp: new Date(),
    });
    return createdMessage.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  async findOne(id: string): Promise<Message | null> {
    return this.messageModel.findById(id).exec();
  }

  async findConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { sender_id: user1Id, receiver_id: user2Id },
          { sender_id: user2Id, receiver_id: user1Id },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  async remove(id: string): Promise<Message | null> {
    return this.messageModel.findByIdAndDelete(id).exec();
  }
}
