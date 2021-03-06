import { Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { SHA256 } from '../../utility/sha256.utility';
import { Ecies } from '../../utility/ecies.utility';
import { AES } from '../../utility/aes.utility';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(payload: CreateUserDto) {
        const { username, secret } = payload;
        const user = await this.userRepository.findOneBy({ username });
        if (user) return null;

        const password = await Bcrypt.hash(secret, `$2b$10$${SHA256.hash(username).slice(0, 22)}`);

        const { publicKey, privateKey } = Ecies.generateKeyPair();
        const aesKey = SHA256.hash(secret).slice(0, 32);
        const aesIv = SHA256.hash(username).slice(0, 16);
        const encryptedPrivateKey = AES.encrypt(privateKey, aesKey, aesIv);

        const newUser = this.userRepository.create({
            username, password,
            nickname: username,
            avatar: 'https://imgur.com/Kf3m1o7.png',
            publicKey, encryptedPrivateKey,
        });
        return this.userRepository.save(newUser);
    }

    async findOne(id: number) {
        return this.userRepository.findOneBy({ id });
    }

    async findOneByUsername(username: string) {
        return this.userRepository.findOneBy({ username });
    }

    async delete(id: number) {
        const user = await this.userRepository.findOneBy({ id });
        return this.userRepository.remove(user);
    }
}
