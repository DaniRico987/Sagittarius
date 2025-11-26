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
  ],
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
  friends: any[] = [];
  friendRequests: any[] = [];
  currentUser: UserChat | null = null;
  newFriendEmail: string = '';

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.userService.getUserName();
    if (this.currentUser) {
      this.loadFriends();
      this.loadFriendRequests();
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
    if (this.currentUser && this.newFriendEmail) {
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
      }
    }
  }

  async acceptRequest(friendId: string) {
    if (this.currentUser) {
      await this.userService.acceptFriendRequest(this.currentUser.id, friendId);
      this.loadFriendRequests();
      this.loadFriends();
    }
  }

  async rejectRequest(friendId: string) {
    if (this.currentUser) {
      await this.userService.rejectFriendRequest(this.currentUser.id, friendId);
      this.loadFriendRequests();
    }
  }
}
