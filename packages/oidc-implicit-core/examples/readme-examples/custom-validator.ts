import {
  getStoredAuthResult,
  parseJwt,
} from "@hawaii-framework/oidc-implicit-core";

getStoredAuthResult([
  (authResult) => {
    if (authResult.access_token) {
      const accessToken = parseJwt(authResult.access_token);
      // The backend is creating special tokens which have `someCustomProperty` set
      // to an expected value. We need to validate this.
      return accessToken["someCustomProperty"] === "someExpectedValue";
    }
    return false;
  },
]);
