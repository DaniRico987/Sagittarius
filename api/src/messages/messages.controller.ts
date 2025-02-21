import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from '../schemas/message.schema';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get()
  async findAll(): Promise<Message[]> {
    return this.messagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Message | null> {
    return this.messagesService.findOne(id);
  }

  @Get('conversation/:user1Id/:user2Id')
  async findConversation(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ): Promise<Message[]> {
    return this.messagesService.findConversation(user1Id, user2Id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Message | null> {
    return this.messagesService.remove(id);
  }
}
