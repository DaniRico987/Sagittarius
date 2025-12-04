import {
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
import { Router, ActivatedRoute } from '@angular/router';
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
  canChat: boolean = true;
  myFriendIds: string[] = [];
  isConnected: boolean = false;

  // Typing indicator
  isOtherUserTyping: boolean = false;
  typingUserName: string = '';
  private typingTimeout: any;

  // Reactions
  showEmojiPicker: { [messageId: string]: boolean } = {};
  availableEmojis: string[] = ['👍', '❤️', '😂', '😮', '😢'];

  constructor(
    private socketService: SocketService,
    private loginService: LoginService,
    private userService: UserService,
    public themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!this.validateUser()) return;

    this.initializeChat();
    this.listenForMessages();
    this.checkScreenSize();
    this.loadFriendsList();

    // Listen for connection status
    this.socketService.connected$.subscribe((connected) => {
      this.isConnected = connected;
      if (!connected) {
        console.warn('⚠️ Desconectado del servidor de chat');
      } else {
        console.log('✅ Conectado al chat');
      }
    });

    // Listen for query params to handle friend selection
    this.route.queryParams.subscribe((params) => {
      if (params['friendId']) {
        this.handleFriendSelection(params['friendId']);
      } else if (params['conversationId']) {
        this.selectConversationById(params['conversationId']);
      }
    });
  }

  async loadFriendsList() {
    try {
      const friends = await this.userService.getFriends(this.user.id);
      this.myFriendIds = friends.map((f: any) => f._id);
    } catch (error) {
      console.error('Error loading friends', error);
    }
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
    this.socketService.joinUserRoom(this.user.id);
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
    this.isOtherUserTyping = false; // Reset typing indicator

    this.checkCanChat(conversation);

    this.socketService.joinChat(conversation._id, this.user.id);

    // Mark messages as read when opening conversation
    this.socketService.socket.emit('messagesRead', {
      conversationId: conversation._id,
      userId: this.user.id,
    });

    if (this.isMobile) {
      this.showSidebar = false;
    }
  }

  onTyping() {
    if (!this.selectedConversation) return;

    // Emit typing event
    this.socketService.socket.emit('userTyping', {
      conversationId: this.selectedConversation._id,
      userId: this.user.id,
      userName: this.user.name,
      isTyping: true,
    });

    // Debounce: stop typing after 1 second of inactivity
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      this.socketService.socket.emit('userTyping', {
        conversationId: this.selectedConversation._id,
        userId: this.user.id,
        userName: this.user.name,
        isTyping: false,
      });
    }, 1000);
  }

  checkCanChat(conversation: any) {
    if (conversation.isGroup) {
      this.canChat = true;
      return;
    }

    const otherParticipant = conversation.participants.find(
      (p: any) => p._id !== this.user.id
    );

    if (otherParticipant) {
      // Refresh friends list to be sure
      this.userService.getFriends(this.user.id).then((friends) => {
        this.myFriendIds = friends.map((f: any) => f._id);
        this.canChat = this.myFriendIds.includes(otherParticipant._id);
      });
    } else {
      this.canChat = false;
    }
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

      // Mark messages as delivered when loaded
      const messageIds = msgs
        .filter((m) => m.sender_id !== this.user.id && m.status === 'sent')
        .map((m) => m._id)
        .filter((id) => id) as string[];

      if (messageIds.length > 0) {
        this.socketService.socket.emit('messageDelivered', { messageIds });
      }
    });

    this.socketService.onEvent<Message>('newMessage').subscribe((message) => {
      if (
        this.selectedConversation &&
        message.conversation_id === this.selectedConversation._id
      ) {
        this.messages.push(message);
        this.scrollToBottom();

        // Mark as delivered immediately if conversation is open
        if (message.sender_id !== this.user.id && message._id) {
          this.socketService.socket.emit('messageDelivered', {
            messageIds: [message._id],
          });
        }
      }

      // Update last message in conversation list
      const conv = this.conversations.find(
        (c) => c._id === message.conversation_id
      );
      if (conv) {
        conv.lastMessage = message;
      }

      // Check if this message is from a conversation we don't have yet
      const conversationExists = this.conversations.some(
        (conv) => conv._id === message.conversation_id
      );

      if (!conversationExists) {
        // Reload conversations to include the new one
        this.loadConversations();
      }
    });

    // Listen for status updates
    this.socketService.onEvent('statusUpdated').subscribe((data: any) => {
      const message = this.messages.find((m) => m._id === data.messageId);
      if (message) {
        message.status = data.status;
        if (data.status === 'delivered') {
          message.deliveredAt = new Date();
        } else if (data.status === 'read') {
          message.readAt = new Date();
        }
      }
    });

    // Listen for typing indicator
    this.socketService.onEvent('userTyping').subscribe((data: any) => {
      if (data.userId !== this.user.id) {
        this.isOtherUserTyping = data.isTyping;
        this.typingUserName = data.userName;

        // Auto-hide typing indicator after 3 seconds
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }
        if (data.isTyping) {
          this.typingTimeout = setTimeout(() => {
            this.isOtherUserTyping = false;
          }, 3000);
        }
      }
    });

    // Listen for friend removed event
    this.socketService.onEvent('friendRemoved').subscribe((data: any) => {
      this.loadFriendsList();

      if (this.selectedConversation && !this.selectedConversation.isGroup) {
        const otherParticipant = this.selectedConversation.participants.find(
          (p: any) => p._id !== this.user.id
        );

        if (otherParticipant && otherParticipant._id === data.friendId) {
          this.canChat = false;
        }
      }
    });

    // Listen for friend request accepted to refresh friends list
    this.socketService.onEvent('friendRequestAccepted').subscribe(() => {
      this.loadFriendsList();
      this.checkScreenSize(); // Re-evaluate if we can chat
    });

    // Listen for reaction updates
    this.socketService.onEvent('reactionUpdated').subscribe((data: any) => {
      const message = this.messages.find((m) => m._id === data.messageId);
      if (message) {
        message.reactions = data.reactions;
      }
    });

    // Listen for unread count updates
    this.socketService.onEvent('unreadCountUpdated').subscribe((data: any) => {
      const conversation = this.conversations.find(
        (c) => c._id === data.conversationId
      );
      if (conversation) {
        if (!conversation.unreadCount) {
          conversation.unreadCount = {};
        }
        conversation.unreadCount[this.user.id] = data.unreadCount;
      }
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

    console.log('💬 Intentando enviar mensaje:', this.messageText);
    if (!this.isConnected) {
      console.error('❌ No se puede enviar: Desconectado');
      alert('No hay conexión con el servidor de chat');
      return;
    }

    this.socketService.sendMessage(
      this.user.id,
      this.messageText,
      this.selectedConversation._id
    );
    this.messageText = '';
  }

  private async handleFriendSelection(friendId: string) {
    this.showFriends = false;

    const existingConv = this.conversations.find(
      (conv) =>
        !conv.isGroup && conv.participants.some((p: any) => p._id === friendId)
    );

    if (existingConv) {
      this.selectConversation(existingConv);
    } else {
      const participants = [this.user.id, friendId];
      await this.socketService.createConversation('', participants, false, []);
      await this.loadConversations();

      const newConv = this.conversations.find(
        (conv) =>
          !conv.isGroup &&
          conv.participants.some((p: any) => p._id === friendId)
      );
      if (newConv) {
        this.selectConversation(newConv);
      }
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  private selectConversationById(conversationId: string) {
    const conv = this.conversations.find((c) => c._id === conversationId);
    if (conv) {
      this.selectConversation(conv);
      this.showFriends = false;
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  getConversationName(conversation: any): string {
    if (conversation.isGroup) {
      return conversation.name || 'Grupo';
    }

    // For 1-on-1 chats, get the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p: any) => p._id !== this.user.id
    );

    return otherParticipant?.name || 'Chat';
  }

  getUnreadCount(conversation: any): number {
    if (!conversation.unreadCount) return 0;
    return conversation.unreadCount[this.user.id] || 0;
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

  toggleEmojiPicker(messageId: string) {
    // Close all other pickers
    Object.keys(this.showEmojiPicker).forEach((key) => {
      if (key !== messageId) {
        this.showEmojiPicker[key] = false;
      }
    });
    // Toggle current picker
    this.showEmojiPicker[messageId] = !this.showEmojiPicker[messageId];
  }

  toggleReaction(message: Message, emoji: string) {
    if (!message._id) return;

    this.socketService.socket.emit('toggleReaction', {
      messageId: message._id,
      userId: this.user.id,
      userName: this.user.name,
      emoji: emoji,
    });

    // Close emoji picker after selection
    this.showEmojiPicker[message._id] = false;
  }

  getReactionCount(message: Message, emoji: string): number {
    if (!message.reactions) return 0;
    return message.reactions.filter((r) => r.emoji === emoji).length;
  }

  hasUserReacted(message: Message, emoji: string): boolean {
    if (!message.reactions) return false;
    return message.reactions.some(
      (r) => r.emoji === emoji && r.userId === this.user.id
    );
  }

  getReactionUsers(message: Message, emoji: string): string {
    if (!message.reactions) return '';
    const users = message.reactions
      .filter((r) => r.emoji === emoji)
      .map((r) => r.userName);
    return users.join(', ');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
