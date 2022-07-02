import { ConflictException } from '@nestjs/common';

export class UserExistedException extends ConflictException {
    constructor() {
        super("This user is already existed.");
    }
}
