import { config } from "../configuration/config.service";
import { StorageUtil } from "./storageUtil";

const nonceStorageId = () => `${config.client_id}-nonce`;

/**
 * Get the saved nonce string from storage
 * @returns {string}
 */
export function getNonce(): string | null {
  return StorageUtil.read(nonceStorageId());
}

/**
 * Saves the state string to sessionStorage
 * @param nonce
 */
export function saveNonce(nonce: string): void {
  StorageUtil.store(nonceStorageId(), nonce);
}

/**
 * Deletes the nonce from sessionStorage
 */
export function deleteNonce(): void {
  StorageUtil.remove("-nonce");
}
