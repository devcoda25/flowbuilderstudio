const KEY_NAME = 'vault.sessionKey.v1'; // stored in sessionStorage

async function importKey(raw: JsonWebKey) {
  return crypto.subtle.importKey('jwk', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function exportKey(key: CryptoKey) {
  return crypto.subtle.exportKey('jwk', key) as Promise<JsonWebKey>;
}

/** Returns the session AES-GCM key, generating if needed. Lives in sessionStorage; cleared on browser close. */
export async function getSessionKey(): Promise<CryptoKey> {
  const existing = sessionStorage.getItem(KEY_NAME);
  if (existing) return importKey(JSON.parse(existing));
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const jwk = await exportKey(key);
  sessionStorage.setItem(KEY_NAME, JSON.stringify(jwk));
  return key;
}

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function fromBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/** Encrypts a UTF‑8 string → base64(iv + ciphertext) */
export async function encryptString(plain: string): Promise<string> {
  const key = await getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plain);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const joined = new Uint8Array(iv.length + new Uint8Array(ct).length);
  joined.set(iv, 0);
  joined.set(new Uint8Array(ct), iv.length);
  return toBase64(joined.buffer);
}

/** Decrypts base64(iv+ciphertext) → UTF‑8 string */
export async function decryptString(payload: string): Promise<string> {
  const buf = new Uint8Array(fromBase64(payload));
  const iv = buf.slice(0, 12);
  const ct = buf.slice(12);
  const key = await getSessionKey();
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plain);
}
