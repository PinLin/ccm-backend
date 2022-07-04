import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

        const { id, password, ...otherUserData } = user;
        return otherUserData;
    }

    @Get(':username')
    async findUser(@Param('username') username: string) {
        const user = await this.userService.findOne(username);
        if (!user) throw new UserNotExistedException();

        const { id, password, ...otherUserData } = user;
        return otherUserData;
    }
}
