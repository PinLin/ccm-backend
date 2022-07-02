import * as crypto from 'crypto';

export class SHA256 {
    static hash(plainText: string) {
        return crypto.createHash('sha256').update(plainText).digest('hex');
    }
}
