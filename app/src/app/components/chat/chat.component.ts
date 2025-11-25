import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../service/socket.service';
import { LoginService } from '../../service/login.service';
import { ThemeService } from '../../service/theme.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { Message } from '../../interface/message.interface';
import { UserService } from '../../service/user.service';
import { UserChat } from '../../interface/user-chat.interface';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
import { FriendsComponent } from '../friends/friends.component';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, FriendsComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  messageText: string = '';
  messages: Message[] = [];
  user!: UserChat;

  conversations: any[] = [];
  selectedConversation: any = null;
  showFriends: boolean = false;
  isMobile: boolean = false;
  showSidebar: boolean = true;

  constructor(
    private socketService: SocketService,
    private loginService: LoginService,
    private userService: UserService,
    public themeService: ThemeService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!this.validateUser()) return;

    this.initializeChat();
    this.listenForMessages();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.showSidebar = true;
    } else {
      // On mobile, show sidebar if no conversation is selected
      this.showSidebar = !this.selectedConversation && !this.showFriends;
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }

  private validateUser(): boolean {
    if (!this.loginService.getTokenValidation()) {
      this.router.navigate(['/login']);
      return false;
    }

    const userData = this.userService.getUserName();
    if (!userData) {
      console.error('⚠️ Error: No se pudo obtener la información del usuario.');
      this.router.navigate(['/login']);
      return false;
    }

    this.user = userData;
    return true;
  }

  private initializeChat() {
    this.socketService.connect();
    this.loadConversations();
  }

  async loadConversations() {
    try {
      this.conversations = await this.socketService.getUserConversations(
        this.user.id
      );
    } catch (error) {
      console.error('Error loading conversations', error);
    }
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.showFriends = false;
    this.messages = [];

    this.socketService.joinChat(conversation._id);

    if (this.isMobile) {
      this.showSidebar = false;
    }
    // The socket will emit 'loadMessages' which we listen to
  }

  toggleFriends() {
    this.showFriends = !this.showFriends;
    this.selectedConversation = null;
    if (this.isMobile && this.showFriends) {
      this.showSidebar = false;
    }
  }

  backToList() {
    this.selectedConversation = null;
    this.showFriends = false;
    this.showSidebar = true;
  }

  openCreateGroupDialog() {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '400px',
      data: { userId: this.user.id },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const participants = [this.user.id, ...result.participants];
        await this.socketService.createConversation(
          result.name,
          participants,
          true,
          [this.user.id]
        );
        this.loadConversations();
      }
    });
  }

  private listenForMessages() {
    this.socketService.onEvent<Message[]>('loadMessages').subscribe((msgs) => {
      this.messages = msgs;
      this.scrollToBottom();
    });

    this.socketService.onEvent<Message>('newMessage').subscribe((message) => {
      if (
        this.selectedConversation &&
        message.conversation_id === this.selectedConversation._id
      ) {
        this.messages.push(message);
        this.scrollToBottom();
      }
      // Update last message in conversation list logic could go here
    });

    // Legacy support if needed
    this.socketService
      .onEvent<Message>('privateMessage')
      .subscribe((message) => {
        // Handle legacy private messages if any
      });
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.selectedConversation) return;

    this.socketService.sendMessage(
      this.user.id,
      this.messageText,
      this.selectedConversation._id
    );
    this.messageText = '';
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  logout() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que deseas cerrar sesión?',
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
        icon: 'logout',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loginService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
