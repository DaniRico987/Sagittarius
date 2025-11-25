import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  // Crear un usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // Obtener todos los usuarios
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Buscar un usuario por ID
  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  // Buscar un usuario por email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Actualizar un usuario
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  // Eliminar un usuario
  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  // Enviar solicitud de amistad
  async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) {
      throw new Error('No puedes enviarte una solicitud a ti mismo');
    }
    const user = await this.userModel.findById(userId);
    const friend = await this.userModel.findById(friendId);

    if (!user || !friend) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si ya son amigos o si ya hay solicitud
    if (user.friends.includes(friendId as any)) {
      throw new Error('Ya son amigos');
    }

    const existingRequest = friend.friendRequests.find(
      (req) => req.from.toString() === userId,
    );
    if (existingRequest) {
      throw new Error('Solicitud ya enviada');
    }

    friend.friendRequests.push({ from: userId as any, status: 'pending' });
    await friend.save();
  }

  // Aceptar solicitud de amistad
  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    const friend = await this.userModel.findById(friendId);

    if (!user || !friend) {
      throw new Error('Usuario no encontrado');
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from.toString() === friendId && req.status === 'pending',
    );

    if (requestIndex === -1) {
      throw new Error('Solicitud no encontrada');
    }

    user.friendRequests[requestIndex].status = 'accepted';
    user.friends.push(friendId as any);
    friend.friends.push(userId as any);

    await user.save();
    await friend.save();
  }

  // Rechazar solicitud de amistad
  async rejectFriendRequest(userId: string, friendId: string): Promise<void> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from.toString() === friendId && req.status === 'pending',
    );

    if (requestIndex === -1) {
      throw new Error('Solicitud no encontrada');
    }

    user.friendRequests[requestIndex].status = 'rejected';
    await user.save();
  }

  // Obtener amigos
  async getFriends(userId: string): Promise<User[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('friends', 'name email avatar');
    return user ? (user.friends as unknown as User[]) : [];
  }

  // Obtener solicitudes pendientes
  async getFriendRequests(userId: string): Promise<any[]> {
    const user = await this.userModel
      .findById(userId)
      .populate('friendRequests.from', 'name email avatar');
    return user
      ? user.friendRequests.filter((req) => req.status === 'pending')
      : [];
  }

  // Actualizar contraseña
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
  }
}
