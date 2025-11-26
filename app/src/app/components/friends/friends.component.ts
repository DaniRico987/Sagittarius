import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { UserService } from '../../service/user.service';
import { UserChat } from '../../interface/user-chat.interface';
import { NotificationService } from '../../service/notification.service';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SocketService } from '../../service/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatTooltipModule,
  ],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  friends: any[] = [];
  friendRequests: any[] = [];
  currentUser: UserChat | null = null;
  newFriendEmail: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private socketService: SocketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUserName();
    if (this.currentUser) {
      this.loadFriends();
      this.loadFriendRequests();

      this.socketService.onEvent('friendRemoved').subscribe(() => {
        this.loadFriends();
        this.loadFriendRequests();
      });
    }
  }

  async loadFriends() {
    if (this.currentUser) {
      this.friends = await this.userService.getFriends(this.currentUser.id);
    }
  }

  async loadFriendRequests() {
    if (this.currentUser) {
      this.friendRequests = await this.userService.getFriendRequests(
        this.currentUser.id
      );
    }
  }

  async sendFriendRequest() {
    if (this.currentUser && this.newFriendEmail && !this.isLoading) {
      this.isLoading = true;
      try {
        await this.userService.sendFriendRequestByEmail(
          this.currentUser.id,
          this.newFriendEmail
        );
        this.newFriendEmail = '';
        this.notificationService.success('Solicitud enviada correctamente');
      } catch (error: any) {
        if (error.status === 409) {
          this.notificationService.warning(
            'Ya has enviado una solicitud a este usuario'
          );
        } else if (error.status === 404) {
          this.notificationService.error('Usuario no encontrado');
        } else {
          this.notificationService.error('Error al enviar solicitud');
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  async acceptRequest(friendId: string) {
    if (this.currentUser && !this.isLoading) {
      this.isLoading = true;
      try {
        await this.userService.acceptFriendRequest(
          this.currentUser.id,
          friendId
        );
        await this.loadFriendRequests();
        await this.loadFriends();
        this.notificationService.success('Solicitud aceptada');
      } catch (error: any) {
        if (error.status === 409) {
          this.notificationService.warning('Ya son amigos');
          await this.loadFriendRequests();
          await this.loadFriends();
        } else {
          this.notificationService.error('Error al aceptar solicitud');
        }
      } finally {
        this.isLoading = false;
      }
    }
  }

  async rejectRequest(friendId: string) {
    if (this.currentUser && !this.isLoading) {
      this.isLoading = true;
      try {
        await this.userService.rejectFriendRequest(
          this.currentUser.id,
          friendId
        );
        await this.loadFriendRequests();
      } catch (error) {
        this.notificationService.error('Error al rechazar solicitud');
      } finally {
        this.isLoading = false;
      }
    }
  }

  deleteFriend(friend: any) {
    if (!this.currentUser || this.isLoading) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar amigo',
        message: `¿Estás seguro de que deseas eliminar a ${friend.name} de tus amigos?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        icon: 'person_remove',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result && this.currentUser) {
        this.isLoading = true;
        try {
          await this.userService.removeFriend(this.currentUser.id, friend._id);
          this.notificationService.success('Amigo eliminado correctamente');
          await this.loadFriends();
        } catch (error) {
          this.notificationService.error('Error al eliminar amigo');
        } finally {
          this.isLoading = false;
        }
      }
    });
  }

  async startChat(friendId: string) {
    if (!this.currentUser) return;

    try {
      // Get all user conversations
      const conversations = await this.socketService.getUserConversations(
        this.currentUser.id
      );

      // Check if a conversation with this friend already exists
      const existingConversation = conversations.find(
        (conv: any) =>
          !conv.isGroup &&
          conv.participants.some((p: any) => p._id === friendId)
      );

      if (existingConversation) {
        // Navigate to existing conversation
        this.router.navigate(['/home'], {
          queryParams: { conversationId: existingConversation._id },
        });
      } else {
        // Create new conversation
        this.router.navigate(['/home'], {
          queryParams: { friendId },
        });
      }
    } catch (error) {
      this.notificationService.error('Error al iniciar conversación');
    }
  }
}
