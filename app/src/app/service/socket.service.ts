import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
import { Message } from '../interface/message.interface';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private endPoint: string = 'http://localhost:3000';

  constructor(private loginService: LoginService) {}

  // Conectar al socket con autenticación
  connect() {
    const token = this.loginService.getTokenValidation()
      ? this.loginService.token
      : null;

    if (!token) {
      console.error('No se encontró un token. No se puede conectar al socket.');
      return;
    }

    this.socket = io(this.endPoint, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Conectado al servidor de sockets');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión al socket:', error);
    });
  }

  // Unirse a una sala privada
  joinPrivateChat(userId: string, receiverId: string) {
    this.socket.emit('joinPrivateChat', { userId, receiverId });
  }

  // Escuchar eventos del servidor
  onEvent<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => {
        subscriber.next(data);
      });

      return () => {
        this.socket.off(event);
      };
    });
  }

  // Obtener mensajes previos de una conversación
  loadPreviousMessages(
    userId: string,
    receiverId: string
  ): Observable<Message[]> {
    return new Observable<Message[]>((subscriber) => {
      const data = { userId, receiverId };
      this.socket.emit('loadMessages', data);

      this.socket.on('loadMessages', (messages: Message[]) => {
        subscriber.next(messages);
      });

      return () => {
        this.socket.off('loadMessages');
      };
    });
  }

  // Enviar un mensaje privado
  sendMessage(senderId: string, receiverId: string, content: string) {
    const message: Message = {
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      timestamp: new Date(),
    };

    const roomId = this.generateRoomId(senderId, receiverId);
    this.socket.emit('privateMessage', message);
  }

  // Desconectar el socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Socket desconectado');
    }
  }

  // Generar un ID de sala único para dos usuarios
  private generateRoomId(user1: string, user2: string): string {
    return [user1, user2].sort().join('-'); // Asegura que la sala siempre tenga el mismo ID
  }
}
