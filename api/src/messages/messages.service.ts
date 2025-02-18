import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectModel('Message') private messageModel: Model<Message>) {}

  // Crear un mensaje
  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const createdMessage = new this.messageModel(createMessageDto);
    return createdMessage.save();
  }

  // Obtener todos los mensajes
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }

  // Obtener un mensaje por ID
  async findOne(id: string): Promise<Message | null> {
    return this.messageModel.findById(id).exec();
  }

  // Eliminar un mensaje
  async remove(id: string): Promise<Message | null> {
    return this.messageModel.findByIdAndDelete(id).exec();
  }
}
