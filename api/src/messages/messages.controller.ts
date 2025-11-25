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

  @Post('conversations')
  async createConversation(@Body() body: { name?: string; participants: string[]; isGroup: boolean; admins?: string[] }) {
    return this.messagesService.createConversation(body.name || '', body.participants, body.isGroup, body.admins || []);
  }

  @Get('conversations/:userId')
  async getUserConversations(@Param('userId') userId: string) {
    return this.messagesService.getUserConversations(userId);
  }

  @Get('conversation/:conversationId')
  async getMessagesByConversation(@Param('conversationId') conversationId: string) {
    return this.messagesService.getMessagesByConversation(conversationId);
  }

  // Obtener mensajes entre dos usuarios (conversación privada) - Legacy/Direct
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
}
