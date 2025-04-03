import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../service/socket.service';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { Message } from '../../interface/message.interface';
import { UserService } from '../../service/user.service';
import { UserChat } from '../../interface/user-chat.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  messageText: string = '';
  messages: Message[] = [];
  user!: UserChat;
  receiverId!: string;

  constructor(
    private socketService: SocketService,
    private loginService: LoginService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.validateUser()) return;

    this.initializeChat();
    this.listenForMessages();
  }



  scrollToBottom() {
    setTimeout(() => {
    this.chatContainer.nativeElement.scrollTop =
      this.chatContainer.nativeElement.scrollHeight;
    },  100);
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
    this.receiverId = this.userService.getReceiverId();

    if (!this.receiverId) {
      console.error('⚠️ Error: No hay un receptor seleccionado.');
      return false;
    }

    return true;
  }

  private initializeChat() {
    this.socketService.connect();
    this.socketService.joinPrivateChat(this.user.id, this.receiverId);

    // Cargar mensajes previos
    this.socketService
      .loadPreviousMessages(this.user.id, this.receiverId)
      .subscribe((msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      });
  }

  private listenForMessages() {
    this.socketService
      .onEvent<Message>('privateMessage')
      .subscribe((message) => {
        this.messages.push(message);
        this.scrollToBottom();
      });
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.receiverId) return;

    this.socketService.sendMessage(
      this.user.id,
      this.receiverId,
      this.messageText
    );
    this.messageText = '';
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}
