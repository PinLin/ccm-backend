import { NotFoundException } from '@nestjs/common';

export class MessageNotExistedException extends NotFoundException {
    constructor() {
        super("This message is not existed.");
    }
}
