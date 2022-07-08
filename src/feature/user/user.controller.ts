import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Session, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../auth/guard/login.guard';
import { ReqSession } from '../auth/types/request-session';
import { CreateUserDto } from './dto/create-user.dto';
import { UserExistedException } from './exception/user-existed.exception';
import { UserNotExistedException } from './exception/user-not-existed.exception';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post()
    async createUser(@Body() payload: CreateUserDto) {
        const user = await this.userService.create(payload);
        if (!user) throw new UserExistedException();

        const { username, nickname, avatar } = user;
        return { username, nickname, avatar };
    }

    @Get(':username')
    async findUser(@Param('username') username: string) {
        const user = await this.userService.findOneByUsername(username);
        if (!user) throw new UserNotExistedException();

        const { nickname, avatar, publicKey } = user;
        return { username, nickname, avatar, publicKey };
    }

    @Delete('me')
    @UseGuards(LoginGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMe(@Session() sess: ReqSession) {
        const user = await this.userService.findOneByUsername(sess.username);
        await this.userService.delete(user.id);

        sess.username = undefined;
        sess.loggedIn = false;
    }
}
