import { OidcConfig } from "../models/config.models";

let oidcConfig: OidcConfig;

/**
 * Gets the current config.
 * @returns The config object.
 */
export function getOidcConfig(): OidcConfig {
  return oidcConfig;
}

/**
 * In case you want to change the entire config, you may use this function.
 * If you want to edit certain properties, using the config from getConfig is fine.
 *
 * @param config The new config object
 */
export function setOidcConfig(config: OidcConfig): void {
  oidcConfig = config;
}
