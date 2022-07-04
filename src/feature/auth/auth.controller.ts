import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Session, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginFailedException } from './exception/login-failed.exception';
import { SessionSaltNotExistedException } from './exception/session-salt-not-existed.exception';
import { LoginGuard } from './guard/login.guard';
import { ReqSession } from './types/request-session';

@Controller('session')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Get()
    async getSessionSalt(@Session() sess: ReqSession) {
        if (!sess.salt) sess.salt = await this.authService.generateSessionSalt();
        // For compatibility with legacy APIs
        return { code: sess.salt };
    }

    @Post()
    async login(@Session() sess: ReqSession, @Body() payload: LoginDto) {
        if (!sess.salt) throw new SessionSaltNotExistedException();

        const { username, password: hashedPassword } = payload;
        const { salt } = sess;
        sess.salt = await this.authService.generateSessionSalt();

        const user = await this.authService.validateUser(username, hashedPassword, salt);
        if (!user) throw new LoginFailedException();

        sess.username = user.username;
        sess.loggedIn = true;

        // For compatibility with legacy APIs
        return {
            user: {
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
            },
        };
    }

    @Delete()
    @UseGuards(LoginGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Session() sess: ReqSession) {
        sess.username = undefined;
        sess.loggedIn = false;
    }
}
