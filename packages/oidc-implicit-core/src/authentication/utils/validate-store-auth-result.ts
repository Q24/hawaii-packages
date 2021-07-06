import { validateAuthResultBackend } from "../../backend-check/validate-auth-result-backend";
import { AuthResult } from "../../jwt/model/auth-result.model";
import { validateAuthResult } from "../../jwt/validate-auth-result";
import { storeAuthResult } from "./auth-result";

/**
 * Parse the token in the Hash
 *
 * Validates if the hash token has the appropriate state which
 * was previously supplied to the server. If this state matches,
 * the client will continue by confirming the validity of the
 * token with the backend. If the token is valid, it is saved
 * locally in the token store and returned.
 */
 export async function validateAndStoreAuthResult(
  authResult: AuthResult,
): Promise<AuthResult> {
  validateAuthResult(authResult);
  await validateAuthResultBackend(authResult);

  // Store the token in the storage
  storeAuthResult(authResult);
  return authResult;
}
