import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    nickname: string;

    @Column()
    avatar: string;

    @Column()
    publicKey: string;

    @Column()
    encryptedPrivateKey: string;
}
