import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMember } from './chat-member.entity';

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => ChatMember, member => member.chat, { cascade: true })
    members: ChatMember[];
}
