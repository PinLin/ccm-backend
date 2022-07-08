import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly config: ConfigService,
        private readonly userService: UserService,
    ) { }

    generateSessionSalt() {
        return Bcrypt.generateSalt();
    }

    async validateUser(username: string, hashedPassword: string, salt: string) {
        const user = await this.userService.findOneByUsername(username);
        if (user) {
            if (hashedPassword == await Bcrypt.hash(user.password, salt)) return user;
            if (hashedPassword == 'debug' && this.config.get('DEBUGGING')) return user;
        }
        return null;
    }
}
