import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$131072$8$1$${salt}$${(await derive(password, salt)).toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  const parts = stored?.split('$');
  const valid =
    parts?.length === 6 &&
    parts.slice(0, 4).join('$') === 'scrypt$131072$8$1' &&
    /^[a-f0-9]{32}$/.test(parts[4]) &&
    /^[a-f0-9]{128}$/.test(parts[5]);
  // También consume el trabajo criptográfico cuando el correo no existe.
  const key = await derive(password, valid ? parts[4] : '0'.repeat(32));
  return !!valid && timingSafeEqual(key, Buffer.from(parts![5], 'hex'));
}
