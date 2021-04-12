import { StorageUtil } from "./storageUtil";
import { oidcConfig } from "../services/config.service";

/**
 * Get the saved session ID string from storage
 * @returns {string}
 */
export function getSessionId(): string | null {
  return StorageUtil.read(`${oidcConfig.client_id}-session-id`);
}

/**
 * Saves the session ID to sessionStorage
 * @param {string} sessionId
 */
export function saveSessionId(sessionId: string): void {
  StorageUtil.store(`${oidcConfig.client_id}-session-id`, sessionId);
}

/**
 * Deletes the session ID from sessionStorage
 */
export function deleteSessionId(): void {
  StorageUtil.remove("-session-id");
}
