import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';

@Entity()
export class ChatMember {
    @PrimaryColumn()
    chatId: number;

    @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
    chat: Chat;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ length: 1024 })
    encryptedMessageKey: string;
}
