import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from '../schemas/message.schema';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Crear un nuevo mensaje privado
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      return await this.messagesService.createMessage(createMessageDto);
    } catch (error) {
      throw new Error('Error al enviar el mensaje privado');
    }
  }

  // Obtener todas las conversaciones del usuario autenticado
  // @Get('user/:userId')
  // async getUserConversations(@Param('userId') userId: string): Promise<any[]> {
  //   try {
  //     return await this.messagesService.getUserConversations(userId);
  //   } catch (error) {
  //     throw new Error('Error al cargar las conversaciones');
  //   }
  // }

  // Obtener mensajes entre dos usuarios (conversación privada)
  @Get('chat/:userId/:receiverId')
  async getConversation(
    @Param('userId') userId: string, 
    @Param('receiverId') receiverId: string
  ): Promise<Message[]> {
    try {
      return await this.messagesService.getConversation(userId, receiverId);
    } catch (error) {
      throw new Error('Error al cargar la conversación');
    }
  }

  // // Eliminar un mensaje por ID
  // @Delete(':id')
  // async delete(@Param('id') id: string): Promise<{ message: string }> {
  //   try {
  //     await this.messagesService.deleteMessage(id);
  //     return { message: 'Mensaje eliminado correctamente' };
  //   } catch (error) {
  //     throw new Error('Error al eliminar el mensaje');
  //   }
  // }
}
