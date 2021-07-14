import { deleteAuthResults } from "../authentication/utils/auth-result";
import { deleteIdTokenHint } from "../authentication/utils/id-token-hint";
import { deleteSessionId } from "../backend-check/session-id";
import { deleteStoredCsrfToken } from "../csrf/csrf";
import { deleteStoredUserInfo } from "../user-info/user-info-storage";
import { LogUtil } from "./logUtil";
import { deleteNonce } from "./nonceUtil";
import { deleteState } from "./stateUtil";

/**
 * Cleans up the current session: deletes the stored local tokens, state, nonce,
 * id token hint, CSRF token, json web key set, id provider metadata, user info.
 */
export function cleanSessionStorage(): void {
  LogUtil.debug("cleanSessionStorage: cleaning all session storage items.");
  deleteAuthResults();
  deleteIdTokenHint();
  deleteState();
  deleteNonce();
  deleteSessionId();
  deleteStoredCsrfToken();
  deleteStoredUserInfo();
}
