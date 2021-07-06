import { OidcConfigService } from "../configuration/config.service";
import { AuthResultFilter } from "./model/auth-result-filter.model";

export function getAllAuthResultFilters(
  extraAuthResultFilters?: AuthResultFilter[],
): AuthResultFilter[] {
  return [
    ...(OidcConfigService.config.defaultAuthResultFilters || []),
    ...(extraAuthResultFilters ?? []),
  ];
}
