import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { MessageType } from '../feature/chat/enum/message.enum';
import { Chat } from './chat.entity';
import { User } from './user.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
    chat: Chat;

    @Column()
    senderId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    sender: User;

    @Column()
    type: MessageType;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn()
    timestamp: Date;
}
