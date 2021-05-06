import { OidcConfig } from "../models/config.models";

let oidcConfig: OidcConfig | undefined;

/**
 * A service containing the config
 */
export const OidcConfigService = {
  /**
   * Get the global OIDC config
   */
  get config(): OidcConfig {
    return oidcConfig;
  },
  /**
   * Set the global OIDC config
   */
  set config(config: OidcConfig) {
    oidcConfig = config;
  },
};
