import { StorageUtil } from "./storageUtil";
import { LogUtil } from "./logUtil";
import { OidcConfigService } from "../configuration/config.service";

/**
 * Get the saved state string from sessionStorage
 */
export function getState(): string | null {
  const state = StorageUtil.read(
    `${OidcConfigService.config.client_id}-state`,
  );
  if (!state) {
    LogUtil.debug("state was not found in storage", state);
    return null;
  }
  LogUtil.debug("Got state from storage", state);
  return state;
}

/**
 * Saves the state string to sessionStorage
 */
export function saveState(state: string): void {
  LogUtil.debug("State saved");
  StorageUtil.store(`${OidcConfigService.config.client_id}-state`, state);
}

/**
 * Deletes the state from sessionStorage
 */
export function deleteState(): void {
  LogUtil.debug(`Deleted state`);
  StorageUtil.remove("-state");
}
