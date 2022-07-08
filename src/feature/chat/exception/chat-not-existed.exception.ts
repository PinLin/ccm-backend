import { NotFoundException } from '@nestjs/common';

export class ChatNotExistedException extends NotFoundException {
    constructor() {
        super("This chat is not existed.");
    }
}
