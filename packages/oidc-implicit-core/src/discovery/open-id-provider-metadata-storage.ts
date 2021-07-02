import { OpenIDProviderMetadata } from "../models/open-id-provider-metadata.models";
import { OidcConfigService } from "../services/config.service";
import { StorageUtil } from "../utils/storageUtil";

const openIDProviderMetadataStorageKey = "OpenIDProviderMetadata";

export const getStoredOpenIDProviderMetadata = (): OpenIDProviderMetadata => {
  const openIDProviderMetadataString = StorageUtil.read(
    openIDProviderMetadataStorageKey,
  );
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
  OidcConfigService.config.providerMetadata = stored;
};
