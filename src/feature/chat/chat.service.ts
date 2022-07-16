import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMember } from '../../entity/chat-member.entity';
import { Chat } from '../../entity/chat.entity';
import * as crypto from 'crypto';
import { Ecies } from '../../utility/ecies.utility';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
        @InjectRepository(ChatMember)
        private readonly chatMemberRepository: Repository<ChatMember>,
    ) { }

    async createChat(ownerId: number, ownerPublicKey: string, guestId: number, guestPublicKey: string) {
        const messageKey = crypto.randomBytes(32).toString('hex').slice(0, 32);

        const chat = this.chatRepository.create();
        chat.members = [
            this.chatMemberRepository.create({
                userId: ownerId,
                encryptedMessageKey: await Ecies.encrypt(ownerPublicKey, messageKey),
            }),
            this.chatMemberRepository.create({
                userId: guestId,
                encryptedMessageKey: await Ecies.encrypt(guestPublicKey, messageKey),
            }),
        ];
        return this.chatRepository.save(chat);
    }

    async findChatByUserIds(userId1: number, userId2: number) {
        if (userId1 == userId2) return null;

        const member = await this.chatMemberRepository.createQueryBuilder('member1')
            .innerJoin(ChatMember, 'member2', 'member2.chatId = member1.chatId')
            .andWhere("member1.userId = :userId1", { userId1: userId1 })
            .andWhere("member2.userId = :userId2", { userId2: userId2 })
            .getOne();
        if (!member) return null;
        return this.chatRepository.findOne({
            where: { id: member.chatId },
            relations: ['members'],
        })
    }
}
