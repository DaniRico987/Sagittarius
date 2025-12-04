import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class UsersGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UsersGateway.name);

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    client.join(`user_${userId}`);
    this.logger.log(`Client ${client.id} joined user room user_${userId}`);
  }

  notifyFriendRemoved(userId: string, friendId: string) {
    // Notify the user who performed the action (optional, as they know they did it)
    this.server.to(`user_${userId}`).emit('friendRemoved', { friendId });

    // Notify the friend who was removed
    this.server
      .to(`user_${friendId}`)
      .emit('friendRemoved', { friendId: userId });
  }

  notifyFriendRequestSent(fromUserId: string, toUserId: string, fromUser: any) {
    this.server.to(`user_${toUserId}`).emit('friendRequestReceived', {
      requestId: fromUserId, // Using userId as requestId for simplicity or generate one
      from: fromUser,
      status: 'pending',
    });
  }

  notifyFriendRequestAccepted(userId: string, friendId: string, friend: any) {
    // Notify the user who sent the request that it was accepted
    this.server.to(`user_${friendId}`).emit('friendRequestAccepted', {
      friendId: userId,
      friend: friend, // The user who accepted
    });
  }

  notifyFriendRequestRejected(userId: string, friendId: string) {
    // Notify the user who sent the request that it was rejected
    this.server.to(`user_${friendId}`).emit('friendRequestRejected', {
      friendId: userId,
    });
  }
}
