import { Injectable } from '@nestjs/common';
import { User } from '../../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { SHA256 } from '../../utility/sha256.utility';

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

        const newUser = this.userRepository.create({
            username, password,
            nickname: username,
            avatar: 'https://imgur.com/Kf3m1o7.png',
        });
        return this.userRepository.save(newUser);
    }

    async findOne(username: string) {
        return this.userRepository.findOneBy({ username });
    }

    async delete(username: string) {
        const user = await this.userRepository.findOneBy({ username });
        return this.userRepository.remove(user);
    }
}
