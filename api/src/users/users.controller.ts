import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Crear un nuevo usuario
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Obtener todos los usuarios
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // Obtener un usuario por ID con validación
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Actualizar un usuario (actualización parcial)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('friend-request/email')
  async sendFriendRequestByEmail(
    @Body() body: { userId: string; friendEmail: string },
  ) {
    return this.usersService.sendFriendRequestByEmail(
      body.userId,
      body.friendEmail,
    );
  }

  @Post('friend-request/accept')
  async acceptFriendRequest(
    @Body() body: { userId: string; friendId: string },
  ) {
    return this.usersService.acceptFriendRequest(body.userId, body.friendId);
  }

  @Post('friend-request/reject')
  async rejectFriendRequest(
    @Body() body: { userId: string; friendId: string },
  ) {
    return this.usersService.rejectFriendRequest(body.userId, body.friendId);
  }

  @Delete(':userId/friends/:friendId')
  async removeFriend(
    @Param('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.usersService.removeFriend(userId, friendId);
  }

  @Get(':id/friends')
  async getFriends(@Param('id') id: string) {
    return this.usersService.getFriends(id);
  }

  @Get(':id/friend-requests')
  async getFriendRequests(@Param('id') id: string) {
    return this.usersService.getFriendRequests(id);
  }
}
