import { OidcConfig } from "../models/config.models";

let oidcConfig: OidcConfig | undefined;

export const OidcConfigService = {
  get config(): OidcConfig {
    return oidcConfig;
  },
  set config(config: OidcConfig) {
    oidcConfig = config;
  },
};
