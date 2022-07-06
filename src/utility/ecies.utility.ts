import * as eccrypto from 'eccrypto';

export class Ecies {
    static generateKeyPair() {
        const privateKeyBuf = eccrypto.generatePrivate();
        const publicKeyBuf = eccrypto.getPublic(privateKeyBuf);
        return {
            privateKey: privateKeyBuf.toString('hex'),
            publicKey: publicKeyBuf.toString('hex'),
        };
    }

    static async encrypt(publicKey: string, plaintext: string) {
        const publicKeyBuf = Buffer.from(publicKey, 'hex');
        const plaintextBuf = Buffer.from(plaintext, 'utf8');

        const ciphertextObj = await eccrypto.encrypt(publicKeyBuf, plaintextBuf);
        Object.keys(ciphertextObj).forEach(key => {
            ciphertextObj[key] = ciphertextObj[key].toString('hex');
        });
        return JSON.stringify(ciphertextObj)
    }

    static async decrypt(privateKey: string, ciphertext: string) {
        const privateKeyBuf = Buffer.from(privateKey, 'hex');
        const ciphertextObj = JSON.parse(ciphertext);

        Object.keys(ciphertextObj).forEach(key => {
            ciphertextObj[key] = Buffer.from(ciphertextObj[key], 'hex');
        });
        const plaintextBuf = await eccrypto.decrypt(privateKeyBuf, ciphertextObj);
        return plaintextBuf.toString('utf8');
    }
}
