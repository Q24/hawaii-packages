import { OidcConfig } from "../models/config.models";

let _oidcConfig: OidcConfig;

export function getOidcConfig(): OidcConfig {
  return _oidcConfig;
}

export function setOidcConfig(config: OidcConfig): void {
  _oidcConfig = config;
}
