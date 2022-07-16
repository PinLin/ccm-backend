import { Body, Controller, Get, Param, Post, Session, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../auth/guard/login.guard';
import { ReqSession } from '../auth/types/request-session';
import { UserNotExistedException } from '../user/exception/user-not-existed.exception';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatExistedException } from './exception/chat-existed.exception';
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
}
