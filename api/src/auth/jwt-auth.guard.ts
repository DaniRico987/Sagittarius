import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      console.log('🚨 No se encontró el token en el header Authorization');
      throw new UnauthorizedException('No se encontró el token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'miClaveSuperSecreta123');

      // Adjunta la información del usuario a la request para su uso en controladores
      request.user = decoded;
      return true;
    } catch (err) {
      console.log('🚨 Token inválido:', err.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
