import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class MessagesGateway {
  @WebSocketServer()
  server: any;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: any,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data.conversationId) {
      this.logger.warn('❌ ID de conversación inválido');
      return;
    }

    client.join(data.conversationId);
    this.logger.log(`✅ Usuario unido a la sala ${data.conversationId}`);

    try {
      const messages = await this.messagesService.getMessagesByConversation(data.conversationId);
      client.emit('loadMessages', messages);
      this.logger.log(`📜 Mensajes previos enviados a la sala ${data.conversationId}`);
    } catch (error) {
      this.logger.error('🚨 Error al cargar mensajes previos', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() messageDto: CreateMessageDto) {
    try {
      if (typeof messageDto !== 'object' || !messageDto.content || (!messageDto.conversation_id && !messageDto.receiver_id)) {
        this.logger.warn('❌ Mensaje inválido recibido', messageDto);
        return;
      }

      const savedMessage = await this.messagesService.createMessage(messageDto);
      
      // If conversation_id exists, emit to that room
      if (messageDto.conversation_id) {
        this.server.to(messageDto.conversation_id).emit('newMessage', savedMessage);
        this.logger.log(`📩 Mensaje enviado a la sala ${messageDto.conversation_id}`);
      } else if (messageDto.sender_id && messageDto.receiver_id) {
         // Legacy/Direct support
         const room = this.getRoomId(messageDto.sender_id, messageDto.receiver_id);
         this.server.to(room).emit('privateMessage', savedMessage); // Keeping 'privateMessage' for legacy
      }
    } catch (error) {
      this.logger.error('🚨 Error al manejar el mensaje', error);
    }
  }

  // Legacy support
  @SubscribeMessage('joinPrivateChat')
  async handleJoinPrivateChat(
    @ConnectedSocket() client: any,
    @MessageBody() data: { userId: string; receiverId: string },
  ) {
     const room = this.getRoomId(data.userId, data.receiverId);
     client.join(room);
     // ... load messages logic if needed
  }

  private getRoomId(userId: string, receiverId: string): string {
    return [userId, receiverId].sort().join('-');
  }
}
