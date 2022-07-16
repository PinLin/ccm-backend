import { ForbiddenException } from '@nestjs/common';

export class CreateSelfChatException extends ForbiddenException {
    constructor() {
        super("Could not create a chat with only yourself.");
    }
}
