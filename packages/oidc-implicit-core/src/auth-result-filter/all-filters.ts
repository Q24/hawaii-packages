import { config } from "../configuration/config.service";
import { AuthResultFilter } from "./model/auth-result-filter.model";

export function getAllAuthResultFilters(
  extraAuthResultFilters?: AuthResultFilter[],
): AuthResultFilter[] {
  return [
    ...(config.defaultAuthResultFilters || []),
    ...(extraAuthResultFilters ?? []),
  ];
}
