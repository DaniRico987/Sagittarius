import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: { name: string; email: string; password: string }) {
    const { name, email, password } = userData;
  
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });
  
    // Generar token después del registro
    const payload = { email: newUser.email, sub: newUser.id };
    const token = this.jwtService.sign(payload);
  
    return {
      message: 'Usuario registrado con éxito',
      access_token: token, // Retorna el token para login automático
    };
  }
  

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user['_doc'].email, sub: user['_doc']._id }; // Asegúrate de incluir estos datos
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET || 'miClaveSuperSecreta123',
      }),
    };
  }
}
