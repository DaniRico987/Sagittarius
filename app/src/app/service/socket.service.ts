import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;
  endPoint!: string;

  constructor(public loginService: LoginService) {
    this.endPoint = loginService.getEndpoint();
    this.socket = io(this.endPoint);
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
