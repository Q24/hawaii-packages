import { config } from "../configuration/config.service";
import { StorageUtil } from "../utils/storageUtil";

const createSessionIdStorageId = () => `${config.client_id}-session-id`;

/**
 * Get the saved session ID string from storage
 * @returns {string}
 */
export function getSessionId(): string | null {
  return StorageUtil.read(createSessionIdStorageId());
}

/**
 * Saves the session ID to sessionStorage
 * @param {string} sessionId
 */
export function saveSessionId(sessionId: string): void {
  StorageUtil.store(createSessionIdStorageId(), sessionId);
}

/**
 * Deletes the session ID from sessionStorage
 */
export function deleteSessionId(): void {
  StorageUtil.remove("-session-id");
}
