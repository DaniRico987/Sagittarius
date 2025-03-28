import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../service/socket.service';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';
import { Message } from '../../interface/message.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messageText: string = '';
  messages: Message[] = [] as Message[];

  constructor(
    private socketService: SocketService,
    public loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.loginService.getTokenValidation()) {
      this.router.navigate(['/login']);
    }

    // Escuchar mensajes del socket
    this.socketService.onEvent('chatMessage').subscribe((message: Message) => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      this.socketService.emitEvent('chatMessage', this.messageText);
      this.messageText = '';
    }
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}
