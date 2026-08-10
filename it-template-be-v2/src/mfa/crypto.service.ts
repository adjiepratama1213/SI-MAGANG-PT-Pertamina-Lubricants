import { Injectable } from '@nestjs/common';
import { CipherGCMTypes, createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const GCM_IV_LEN = 12;

@Injectable()
export default class CryptoService {
  algorithm: CipherGCMTypes = 'aes-256-gcm';

  constructor() {}

  /** Derive a 32-byte key for aes-256-gcm from any-length password (e.g. ENCRYPTION_KEY). */
  private deriveKey(password: string): Buffer {
    if (!password || typeof password !== 'string') {
      throw new Error('Encryption key (ENCRYPTION_KEY) is required and must be a non-empty string');
    }
    return createHash('sha256').update(password, 'utf8').digest();
  }

  getRandomString(num: number = 8): string {
    return randomBytes(num).toString('hex');
  }

  getHashString(input: string): string {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }

  encrypt(text: string, password: string): string {
    const key = this.deriveKey(password);
    const iv = randomBytes(GCM_IV_LEN);
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}.${tag}.${encrypted}`;
  }

  decrypt(encryptedData: string, password: string): string {
    const [ivHex, tag, content] = encryptedData.split('.');
    const key = this.deriveKey(password);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let dec = decipher.update(content, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  encryptB64(text: string, password: string): string {
    const key = this.deriveKey(password);
    const iv = randomBytes(GCM_IV_LEN);
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag().toString('base64');
    return `${iv.toString('base64')}.${tag}.${encrypted}`;
  }

  decryptB64(encryptedData: string, password: string): string {
    const [ivB64, tag, content] = encryptedData.split('.');
    const key = this.deriveKey(password);
    const iv = Buffer.from(ivB64, 'base64');
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    let dec = decipher.update(content, 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
}
