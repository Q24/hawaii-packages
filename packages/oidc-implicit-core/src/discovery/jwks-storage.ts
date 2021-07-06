import type { JsonWebKeySet } from "./model/jwks.model";
import { OidcConfigService } from "../configuration/config.service";
import { StorageUtil } from "../utils/storageUtil";

const jsonWebKeySetStorageKey = "JsonWebKeySet";

export const getStoredJsonWebKeySet = (): JsonWebKeySet | null => {
  const jsonWebKeySetString = StorageUtil.read(jsonWebKeySetStorageKey);
  if (!jsonWebKeySetString) {
    return null;
  }
  return JSON.parse(jsonWebKeySetString);
};
export const setStoredJsonWebKeySet = (jsonWebKeySet: JsonWebKeySet): void =>
  StorageUtil.store(jsonWebKeySetStorageKey, JSON.stringify(jsonWebKeySet));

export const deleteStoredJsonWebKeySet = (): void => {
  StorageUtil.remove(jsonWebKeySetStorageKey);
};

export const restoreJsonWebKeySet = () => {
  const stored = getStoredJsonWebKeySet();
  if (stored) {
    OidcConfigService.config.jwks = stored;
  }
};
