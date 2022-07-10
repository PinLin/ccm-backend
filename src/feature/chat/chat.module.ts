import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMember } from '../../entity/chat-member.entity';
import { Chat } from '../../entity/chat.entity';
import { Message } from '../../entity/message.entity';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, Message]),
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule { }
