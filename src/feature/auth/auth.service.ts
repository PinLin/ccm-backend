import { Injectable } from '@nestjs/common';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
    ) { }

    generateSessionSalt() {
        return Bcrypt.generateSalt();
    }

    async validateUser(username: string, hashedPassword: string, salt: string) {
        const user = await this.userService.findOne(username);
        if (user && await Bcrypt.hash(user.password, salt) == hashedPassword) {
            return user;
        }
        return null;
    }
}
