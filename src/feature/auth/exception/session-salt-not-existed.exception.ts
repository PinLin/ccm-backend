import { UnauthorizedException } from '@nestjs/common';

export class SessionSaltNotExistedException extends UnauthorizedException {
    constructor() {
        super("Call GET /session and hash the password by the salt you got.");
    }
}
