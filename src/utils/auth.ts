import * as Crypto from 'expo-crypto';

/** Hash SHA-256 de una contraseña. Nunca se guarda en texto plano. */
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
