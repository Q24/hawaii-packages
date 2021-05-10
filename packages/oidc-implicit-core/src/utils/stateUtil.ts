import { StorageUtil } from "./storageUtil";
import { LogUtil } from "./logUtil";
import { State } from "../models/session.models";
import { OidcConfigService } from "../services/config.service";

/**
 * Get the saved state string from sessionStorage
 */
export function getState(): State | null {
  const stateString = StorageUtil.read(
    `${OidcConfigService.config.client_id}-state`,
  );
  if (!stateString) {
    LogUtil.debug("state was not found in storage", stateString);
    return null;
  }
  const storedState = JSON.parse(stateString);
  LogUtil.debug("Got state from storage", storedState);
  return storedState;
}

/**
 * Saves the state string to sessionStorage
 */
export function saveState(state: State): void {
  LogUtil.debug("State saved");
  StorageUtil.store(
    `${OidcConfigService.config.client_id}-state`,
    JSON.stringify(state),
  );
}

/**
 * Deletes the state from sessionStorage
 */
export function deleteState(): void {
  LogUtil.debug(`Deleted state`);
  StorageUtil.remove("-state");
}
