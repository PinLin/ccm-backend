import { UnauthorizedException } from '@nestjs/common';

export class LoginFailedException extends UnauthorizedException {
    constructor() {
        super("The user is not existed or the password is wrong.");
    }
}
