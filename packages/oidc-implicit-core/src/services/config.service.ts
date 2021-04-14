import { OidcConfig } from "../models/config.models";

let oidcConfig: OidcConfig;

export function getOidcConfig(): OidcConfig {
  return oidcConfig;
}

export function setOidcConfig(config: OidcConfig): void {
  oidcConfig = config;
}
