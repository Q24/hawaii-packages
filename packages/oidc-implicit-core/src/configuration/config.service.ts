import { OidcConfig } from "./model/config.model";

export let config: OidcConfig = {} as OidcConfig;

export function configure(
  configuration: ((configuration: OidcConfig) => OidcConfig) | OidcConfig,
): void {
  if (typeof configuration === "function") {
    config = configuration(config);
  } else {
    config = configuration;
  }
}
