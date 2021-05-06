import { OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.getStoredToken({
  customTokenValidator: (token) => {
    if (token.access_token) {
      const accessToken = OidcService.parseJwt(token.access_token);
      // The backend is creating special tokens which have `someCustomProperty` set
      // to an expected value. We need to validate this.
      return accessToken["someCustomProperty"] === 'someExpectedValue';
    }
    return false;
  },
});
