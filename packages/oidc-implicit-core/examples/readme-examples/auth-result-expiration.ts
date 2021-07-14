import {
  AuthResult,
  checkSession,
  getAuthHeader,
  getStoredAuthResult,
  silentRefresh,
} from "@hawaii-framework/oidc-implicit-core";
import { AxiosRequestConfig } from "axios";

const refreshTokenAboutToExpire = (authResult?: AuthResult) => {
  if (
    authResult &&
    // The expiry time is calculated in seconds since 1970
    // Check if the token expires in the next 5 minutes, if so, trigger a
    // silent refresh of the Access Token in the OIDC Service
    (authResult.expires || 0) - Date.now() / 1000 < 300
  ) {
    silentRefresh();
  }
};

// ==================================================
// == SOMEWHERE IN THE ROUTER AUTHENTICATION CHECK ==
// ==================================================
checkSession().then((authResult) => {
  if (authResult) {
    // If the authentication was successful, we request
    // a new token (if it is about to expire).
    refreshTokenAboutToExpire(authResult);

    // Returning the auth check result here...
  }
});

// =================================
// == SOMEWHERE IN AN API REQUEST ==
// =================================
const storedAuthResult = getStoredAuthResult();
const config: AxiosRequestConfig = {};
if (storedAuthResult) {
  config.headers["Authorization"] = getAuthHeader(storedAuthResult);
  // After adding the headers, we request
  // a new token (if it is about to expire).
  refreshTokenAboutToExpire(storedAuthResult);
}
