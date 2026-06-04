// Wire format: [12-byte IV][ciphertext][16-byte GCM tag]
// Web Crypto AES-GCM appends the auth tag to ciphertext output, matching Node.js side naturally.

export async function deriveKey(token: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`alph-relay-v1:${token}`)
  );
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(key: CryptoKey, plaintext: string): Promise<string> {
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    new TextEncoder().encode(plaintext)
  );
  // enc = [ciphertext || 16-byte tag] — wire layout: [IV][ciphertext][tag] ✓
  const out = new Uint8Array(12 + enc.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(enc), 12);
  let s = '';
  for (let i = 0; i < out.length; i++) s += String.fromCharCode(out[i]);
  return btoa(s);
}

export async function decrypt(key: CryptoKey, encoded: string): Promise<string> {
  const raw = atob(encoded);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  const iv  = buf.subarray(0, 12);
  const enc = buf.subarray(12); // [ciphertext || tag] — Web Crypto expects tag at end ✓
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, enc);
  return new TextDecoder().decode(dec);
}
