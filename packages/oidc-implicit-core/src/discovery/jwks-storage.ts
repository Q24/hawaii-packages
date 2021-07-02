import type { JsonWebKeySet } from "../jwt/model/jwk.model";
import { OidcConfigService } from "../services/config.service";
import { StorageUtil } from "../utils/storageUtil";

const jsonWebKeySetStorageKey = "JsonWebKeySet";

export const getStoredJsonWebKeySet = (): JsonWebKeySet => {
  const jsonWebKeySetString = StorageUtil.read(jsonWebKeySetStorageKey);
  return JSON.parse(jsonWebKeySetString);
};
export const setStoredJsonWebKeySet = (jsonWebKeySet: JsonWebKeySet): void =>
  StorageUtil.store(jsonWebKeySetStorageKey, JSON.stringify(jsonWebKeySet));

export const deleteStoredJsonWebKeySet = (): void => {
  StorageUtil.remove(jsonWebKeySetStorageKey);
};

export const restoreJsonWebKeySet = () => {
  const stored = getStoredJsonWebKeySet();
  OidcConfigService.config.jwks = stored;
};
