import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      'mongodb+srv://danielrico2004:Manchitas12@sagittarius.6fck3.mongodb.net/Sagittarius?retryWrites=true&w=majority&appName=Sagittarius',
    ),
    UsersModule,
    MessagesModule,
    AuthModule,
  ],
})
export class AppModule {}
