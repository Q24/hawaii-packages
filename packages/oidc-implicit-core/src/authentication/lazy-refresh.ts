import { discovery } from "../discovery/discovery";
import { AuthResult } from "../jwt/model/auth-result.model";
import { AuthValidationOptions } from "../jwt/model/auth-validation-options.model";
import { silentRefresh } from "./silent-refresh";

/**
 * Check if the token expires in the next *x* seconds.
 *
 * If this is the case, a silent refresh will be triggered and the Promise will
 * resolve to `true`.
 *
 * If the token does not expire within *x* seconds, the Promise will resolve to
 * `false` instead.
 *
 * @param authResult the token to check
 * @param tokenValidationOptions extra validations for the token
 * @returns A promise. May throw an error if the token we got from the refresh
 * is not valid.
 */
export async function lazyRefresh(
  authResult: AuthResult,
  tokenValidationOptions?: AuthValidationOptions & {
    almostExpiredThreshold?: number;
  },
): Promise<void> {
  await discovery();
  if (
    almostExpired(authResult, tokenValidationOptions?.almostExpiredThreshold)
  ) {
    const silentRefreshToken = await silentRefresh(
      tokenValidationOptions,
    );
    if (!silentRefreshToken) {
      throw Error("invalid_token");
    }
  }
}

function almostExpired(authResult: AuthResult, threshold?: number) {
  return (
    authResult.expires &&
    authResult.expires - Math.round(new Date().getTime() / 1000.0) <
      (threshold ?? 300)
  );
}
