import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { UserChat } from '../interface/user-chat.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  receiver_id: string = '67d19052d5c06b0616b36c93'; // ID del receptor (ejemplo estático)
  constructor(private loginService: LoginService) {}

  getReceiverId(): string {
    return this.receiver_id;
  }
  

  getUserName(): UserChat | null {
    const token: string | null = this.loginService.getTokenValidation()
      ? this.loginService.token
      : null;

    if (!token) return null;

    try {
      const tokenParts = token.split('.');

      // Validamos que el token tenga tres partes (header, payload, signature)
      if (tokenParts.length !== 3) {
        console.error('Token JWT inválido');
        return null;
      }

      const payloadBase64 = tokenParts[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const user: UserChat = {
        id: decodedPayload.sub,
        name: decodedPayload.name,
      };

      return user ?? null; // Devuelve `null` si `name` no existe
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
}
