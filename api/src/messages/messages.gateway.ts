import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('joinPrivateChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; receiverId: string },
  ) {
    if (!data.userId || !data.receiverId) {
      this.logger.warn('❌ Usuario o receptor inválidos al unirse a la sala');
      return;
    }

    const room = this.getRoomId(data.userId, data.receiverId);
    client.join(room);
    this.logger.log(`✅ Usuario ${data.userId} unido a la sala ${room}`);

    try {
      const messages = await this.messagesService.getConversation(data.userId, data.receiverId);
      client.emit('loadMessages', messages);
      this.logger.log(`📜 Mensajes previos enviados a la sala ${room}`);
    } catch (error) {
      this.logger.error('🚨 Error al cargar mensajes previos', error);
    }
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(@MessageBody() messageDto: CreateMessageDto) {
    try {
      if (typeof messageDto !== 'object' || !messageDto.sender_id || !messageDto.receiver_id || !messageDto.content) {
        this.logger.warn('❌ Mensaje inválido recibido', messageDto);
        return;
      }

      const savedMessage = await this.messagesService.createMessage(messageDto);
      const room = this.getRoomId(messageDto.sender_id, messageDto.receiver_id);
      this.server.to(room).emit('privateMessage', savedMessage);
      this.logger.log(`📩 Mensaje enviado a la sala ${room}`);
    } catch (error) {
      this.logger.error('🚨 Error al manejar el mensaje privado', error);
    }
  }

  private getRoomId(userId: string, receiverId: string): string {
    return [userId, receiverId].sort().join('-');
  }
}
