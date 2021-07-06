import { deleteAuthResults } from "../authentication/utils/auth-result";
import { deleteIdTokenHint } from "../authentication/utils/id-token-hint";
import { deleteSessionId } from "../backend-check/session-id";
import { deleteStoredCsrfToken } from "../csrf/csrf";
import { deleteNonce } from "./nonceUtil";
import { deleteState } from "./stateUtil";

/**
 * Cleans up the current session: deletes the stored local tokens, state, nonce,
 * id token hint and CSRF token.
 */
export function cleanSessionStorage(): void {
  deleteAuthResults();
  deleteIdTokenHint();
  deleteState();
  deleteNonce();
  deleteSessionId();
  deleteStoredCsrfToken();
}
