import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessageSchema } from 'src/schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
  ],
  providers: [MessagesService,MessagesGateway],
  controllers: [MessagesController],
})
export class MessagesModule {}
