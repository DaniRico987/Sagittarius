import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../service/socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageText: string = '';
  messages: string[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    // Escuchar mensajes del socket
    this.socketService.onEvent('chatMessage').subscribe((message: string) => {
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
