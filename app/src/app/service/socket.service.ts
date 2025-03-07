import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Reemplaza con tu backend
  }

  // Escuchar eventos
  onEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => observer.next(data));
    });
  }

  // Emitir eventos
  emitEvent(event: string, data: any) {
    this.socket.emit(event, data);
  }

  // Desconectar
  disconnect() {
    this.socket.disconnect();
  }
}
