import { OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.silentLogoutByUrl().then((loggedOut) => {
  if (loggedOut) {
    OidcService.cleanSessionStorage();
  }
});
