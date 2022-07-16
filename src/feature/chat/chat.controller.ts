import { Body, Controller, Get, Param, Post, Query, Session, UseGuards } from '@nestjs/common';
import { EventGateway } from '../event/event.gateway';
import { LoginGuard } from '../auth/guard/login.guard';
import { ReqSession } from '../auth/types/request-session';
import { UserNotExistedException } from '../user/exception/user-not-existed.exception';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatExistedException } from './exception/chat-existed.exception';
import { ChatNotExistedException } from './exception/chat-not-existed.exception';
import { CreateSelfChatException } from './exception/create-self-chat.exception';
import { MessageNotExistedException } from './exception/message-not-existed.exception';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly eventGateway: EventGateway,
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

    @Post(':username/message')
    @UseGuards(LoginGuard)
    async sendMessage(
        @Session() sess: ReqSession,
        @Param('username') receiverUsername: string,
        @Body() payload: SendMessageDto,
    ) {
        const sender = await this.userService.findOneByUsername(sess.username);
        const receiver = await this.userService.findOneByUsername(receiverUsername);
        const chat = await this.chatService.findChatByUserIds(sender.id, receiver.id);
        if (!chat) throw new ChatNotExistedException();

        const message = await this.chatService.sendMessage(chat.id, sender.id, payload);
        this.eventGateway.notifyNewMessage(sender.username, receiver.username, message.id);
        // For compatibility with legacy APIs
        return {
            sender: sender.username,
            type: message.type,
            content: message.content,
            timestamp: message.timestamp,
        };
    }

    @Get(':username/message')
    @UseGuards(LoginGuard)
    async getManyMessages(
        @Session() sess: ReqSession,
        @Param('username') username2: string,
        @Query() filter: GetMessagesDto,
    ) {
        const user1 = await this.userService.findOneByUsername(sess.username);
        const user2 = await this.userService.findOneByUsername(username2);
        const chat = await this.chatService.findChatByUserIds(user1.id, user2.id);
        if (!chat) throw new ChatNotExistedException();

        const take = filter.take ?? filter.count ?? 1;
        const skip = filter.skip ?? 0;
        const messages = await this.chatService.getManyMessages(chat.id, take, skip);
        // For compatibility with legacy APIs
        return {
            messages: (await Promise.all(messages.map(async message => {
                const senderUsername = message.senderId == user1.id ? user1.username : user2.username;
                return {
                    sender: senderUsername,
                    type: message.type,
                    content: message.content,
                    timestamp: message.timestamp,
                };
            }))).reverse(),
        };
    }

    @Get(':username/message/:messageId')
    @UseGuards(LoginGuard)
    async getMessage(
        @Session() sess: ReqSession,
        @Param('username') username2: string,
        @Param('messageId') messageId: number,
    ) {
        const user1 = await this.userService.findOneByUsername(sess.username);
        const user2 = await this.userService.findOneByUsername(username2);
        const chat = await this.chatService.findChatByUserIds(user1.id, user2.id);
        if (!chat) throw new ChatNotExistedException();

        const message = await this.chatService.getMessage(chat.id, messageId);
        if (!message) throw new MessageNotExistedException();

        // For compatibility with legacy APIs
        const senderUsername = message.senderId == user1.id ? user1.username : user2.username;
        return {
            sender: senderUsername,
            type: message.type,
            content: message.content,
            timestamp: message.timestamp,
        };
    }
}
