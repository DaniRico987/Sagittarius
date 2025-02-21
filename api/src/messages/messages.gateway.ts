import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private users = new Map<string, string>(); // userID -> socketID

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.users.set(userId, client.id);
      console.log(`Usuario ${userId} conectado con ID ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    message: { sender_id: string; receiver_id: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Mensaje recibido:', message);

    // Guardar mensaje en base de datos
    const savedMessage = await this.messagesService.createMessage(message);

    // Buscar al destinatario y enviarle el mensaje si está conectado
    const receiverSocketId = this.users.get(message.receiver_id);
    if (receiverSocketId) {
      client.to(receiverSocketId).emit('receiveMessage', savedMessage);
    }

    return savedMessage;
  }
}
