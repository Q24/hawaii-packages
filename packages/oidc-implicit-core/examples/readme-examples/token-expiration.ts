import { OidcService, Token } from "@hawaii-framework/oidc-implicit-core";
import { AxiosRequestConfig } from "axios";

const refreshTokenAboutToExpire = (token?: Token) => {
  if (
    token &&
    // The expiry time is calculated in seconds since 1970
    // Check if the token expires in the next 5 minutes, if so, trigger a
    // silent refresh of the Access Token in the OIDC Service
    (token.expires || 0) - Date.now() / 1000 < 300
  ) {
    OidcService.silentRefreshAccessToken();
  }
};

// ==================================================
// == SOMEWHERE IN THE ROUTER AUTHENTICATION CHECK ==
// ==================================================
OidcService.checkSession().then((token) => {
  if (token) {
    // If the authentication was successful, we request
    // a new token (if it is about to expire).
    refreshTokenAboutToExpire(token);

    // Returning the auth check result here...
  }
});

// =================================
// == SOMEWHERE IN AN API REQUEST ==
// =================================
const storedToken = OidcService.getStoredToken();
const config: AxiosRequestConfig = {};
if (storedToken) {
  config.headers["Authorization"] = OidcService.getAuthHeader(storedToken);
  // After adding the headers, we request
  // a new token (if it is about to expire).
  refreshTokenAboutToExpire(storedToken);
}
