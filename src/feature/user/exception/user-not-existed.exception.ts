import { NotFoundException } from '@nestjs/common';

export class UserNotExistedException extends NotFoundException {
    constructor() {
        super("This user is not existed.");
    }
}
