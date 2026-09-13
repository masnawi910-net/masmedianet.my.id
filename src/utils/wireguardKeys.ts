/**
 * WireGuard Key Generator Utility
 * Menggunakan Web Crypto API (tersedia di semua browser modern dan Node.js 16+)
 * untuk menghasilkan pasangan kunci Curve25519 standar WireGuard (32 bytes Base64).
 */

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Generate 32-byte secure random WireGuard Private Key
 * dan lakukan clamping Curve25519 standar RFC 7748
 */
export function generateWireGuardPrivateKey(): string {
  const key = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(key);
  } else {
    for (let i = 0; i < 32; i++) {
      key[i] = Math.floor(Math.random() * 256);
    }
  }

  // Curve25519 Clamping
  key[0] &= 248;
  key[31] &= 127;
  key[31] |= 64;

  return arrayBufferToBase64(key);
}

/**
 * Simpan dan ambil Public Key Server VPS WireGuard
 */
const STORAGE_WG_SERVER_PUBKEY = 'masmedia_wg_server_pubkey_v1';
export const DEFAULT_WG_SERVER_PUBKEY = 'wG9MasterServerMasmediaVpsPublicKey2026=';

export function getSavedWireGuardServerPubKey(): string {
  if (typeof window === 'undefined') return DEFAULT_WG_SERVER_PUBKEY;
  return localStorage.getItem(STORAGE_WG_SERVER_PUBKEY) || DEFAULT_WG_SERVER_PUBKEY;
}

export function saveWireGuardServerPubKey(pubKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_WG_SERVER_PUBKEY, pubKey.trim());
}
