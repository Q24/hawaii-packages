import { getOidcConfig } from 'src/services/config.service';
import { StorageUtil } from "./storageUtil";

/**
 * Get the saved nonce string from storage
 * @returns {string}
 */
export function getNonce(): string | null {
  return StorageUtil.read(`${getOidcConfig().client_id}-nonce`);
}

/**
 * Saves the state string to sessionStorage
 * @param nonce
 */
export function saveNonce(nonce: string): void {
  StorageUtil.store(`${getOidcConfig().client_id}-nonce`, nonce);
}

/**
 * Deletes the nonce from sessionStorage
 */
export function deleteNonce(): void {
  StorageUtil.remove("-nonce");
}
