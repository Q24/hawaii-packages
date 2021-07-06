import { validateAccessToken } from "./access-token-validation";
import { validateIdToken } from "./id-token-validation";
import { AuthResult } from "./model/auth-result.model";
import { validateState } from "./state-validation";

export function validateAuthResult(authResult:AuthResult): void {
  validateState(authResult.state);
  validateIdToken(authResult.id_token);
  validateAccessToken(authResult);
}