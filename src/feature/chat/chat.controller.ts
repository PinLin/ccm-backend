import { Body, Controller, Get, Param, Post, Session, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../auth/guard/login.guard';
import { ReqSession } from '../auth/types/request-session';
import { UserNotExistedException } from '../user/exception/user-not-existed.exception';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatExistedException } from './exception/chat-existed.exception';
import { ChatNotExistedException } from './exception/chat-not-existed.exception';
import { CreateSelfChatException } from './exception/create-self-chat.exception';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService,
    ) { }

    @Post()
    @UseGuards(LoginGuard)
    async createChat(@Session() sess: ReqSession, @Body() payload: CreateChatDto) {
        const owner = await this.userService.findOneByUsername(sess.username);
        const guest = await this.userService.findOneByUsername(payload.username);
        if (!guest) throw new UserNotExistedException();

        if (owner.username == guest.username) throw new CreateSelfChatException();

        if (await this.chatService.findChatByUserIds(owner.id, guest.id)) throw new ChatExistedException();

        const chat = await this.chatService.createChat(owner.id, owner.publicKey, guest.id, guest.publicKey);
        // For compatibility with legacy APIs
        return {
            messageKey: chat.members[0].userId == owner.id ?
                chat.members[0].encryptedMessageKey :
                chat.members[1].encryptedMessageKey,
        };
    }

    @Get(':username')
    @UseGuards(LoginGuard)
    async findChat(@Session() sess: ReqSession, @Param('username') username2: string) {
        const user1 = await this.userService.findOneByUsername(sess.username);
        const user2 = await this.userService.findOneByUsername(username2);
        if (!user2) throw new UserNotExistedException();

        const chat = await this.chatService.findChatByUserIds(user1.id, user2.id);
        if (!chat) throw new ChatNotExistedException();
        // For compatibility with legacy APIs
        return {
            messageKey: chat.members[0].userId == user1.id ?
                chat.members[0].encryptedMessageKey :
                chat.members[1].encryptedMessageKey,
        };
    }

    @Get()
    @UseGuards(LoginGuard)
    async findAllChats(@Session() sess: ReqSession) {
        const user = await this.userService.findOneByUsername(sess.username);
        const chats = await this.chatService.findAllChats(user.id);
        // For compatibility with legacy APIs
        return {
            rooms: await Promise.all(chats.map(async chat => {
                const userId2 = chat.members[0].userId != user.id ?
                    chat.members[0].userId :
                    chat.members[1].userId;
                const user2 = await this.userService.findOne(userId2);
                return {
                    username: user2.username,
                    nickname: user2.nickname,
                    avatar: user2.avatar,
                };
            })),
        };
    }
}
