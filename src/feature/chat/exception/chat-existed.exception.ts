import { ConflictException } from '@nestjs/common';

export class ChatExistedException extends ConflictException {
    constructor() {
        super("This chat is already existed.");
    }
}
