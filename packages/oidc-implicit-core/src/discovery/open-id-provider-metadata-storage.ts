import { OpenIDProviderMetadata } from "./model/openid-provider-metadata.model";
import { OidcConfigService } from "../configuration/config.service";
import { StorageUtil } from "../utils/storageUtil";

const openIDProviderMetadataStorageKey = "OpenIDProviderMetadata";

export const getStoredOpenIDProviderMetadata = (): OpenIDProviderMetadata | null => {
  const openIDProviderMetadataString = StorageUtil.read(
    openIDProviderMetadataStorageKey,
  );
  if (!openIDProviderMetadataString) {
    return null;
  }
  return JSON.parse(openIDProviderMetadataString);
};
export const setStoredOpenIDProviderMetadata = (
  openIDProviderMetadata: OpenIDProviderMetadata,
): void =>
  StorageUtil.store(
    openIDProviderMetadataStorageKey,
    JSON.stringify(openIDProviderMetadata),
  );

export const deleteStoredOpenIDProviderMetadata = (): void => {
  StorageUtil.remove(openIDProviderMetadataStorageKey);
};

export const restoreOpenIDProviderMetadata = () => {
  const stored = getStoredOpenIDProviderMetadata();
  if (stored) {
    OidcConfigService.config.providerMetadata = stored;
  }
};
