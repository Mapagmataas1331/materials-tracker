import { hash, verify } from "@node-rs/argon2";

/**
 * @node-rs/argon2 defaults to the Argon2id variant, which OWASP recommends
 * over bcrypt/scrypt for new applications (resistant to both GPU cracking
 * and side-channel attacks). Prebuilt native bindings ship for
 * win32/linux/darwin so there is no C++ build toolchain required on the
 * factory server, unlike the plain `argon2` npm package.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return hash(plainText, {
    memoryCost: 19456, // ~19 MB, OWASP minimum recommendation for argon2id
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  passwordHash: string,
  plainText: string
): Promise<boolean> {
  try {
    return await verify(passwordHash, plainText);
  } catch {
    return false;
  }
}
