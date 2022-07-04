import * as bcrypt from 'bcrypt';

export class Bcrypt {
    static hash(password: string, salt?: string) {
        return bcrypt.hash(password, salt ?? 10);
    }

    static verify(hash: string, password: string) {
        return bcrypt.compare(password, hash);
    }

    static generateSalt() {
        return bcrypt.genSalt(10);
    }
}
