import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Wire format: [12-byte IV][ciphertext][16-byte GCM tag]
// Matches Web Crypto AES-GCM output layout (which appends tag after ciphertext).

export function deriveKey(token: string): Buffer {
  return createHash('sha256').update(`alph-relay-v1:${token}`).digest();
}

export function encrypt(key: Buffer, plaintext: string): string {
  const iv     = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body   = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return Buffer.concat([iv, body, tag]).toString('base64');
}

export function decrypt(key: Buffer, encoded: string): string {
  const buf      = Buffer.from(encoded, 'base64');
  const iv       = buf.subarray(0, 12);
  const tag      = buf.subarray(buf.length - 16);
  const enc      = buf.subarray(12, buf.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
