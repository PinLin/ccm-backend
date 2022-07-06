import * as crypto from 'crypto';

export class AES {
    static encrypt(plaintext: string, key: string, iv: string) {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const ciphertext = cipher.update(plaintext, 'utf8', 'hex') + cipher.final('hex');
        return ciphertext;
    }

    static decrypt(ciphertext: string, key: string, iv: string) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        const plaintext = decipher.update(ciphertext, 'hex', 'utf8') + decipher.final('utf8')
        return plaintext;
    }
}
