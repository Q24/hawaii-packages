import { getJwks } from "../discovery/get-jwks";
import { getOpenIdProviderMetadata } from "../discovery/get-openid-provider-metadata";
import { restoreJsonWebKeySet } from "../discovery/jwks-storage";
import { restoreOpenIDProviderMetadata } from "../discovery/open-id-provider-metadata-storage";

/**
 * A singleton promise used for initialization.
 */
let initializePromise: Promise<void> | null = null;

async function _initialize() {
  restoreOpenIDProviderMetadata();
  restoreJsonWebKeySet();
  await getOpenIdProviderMetadata();
  await getJwks();
}

export async function init(): Promise<void> {
  if (initializePromise) {
    return initializePromise;
  }
  initializePromise = _initialize();
  return initializePromise;
}
