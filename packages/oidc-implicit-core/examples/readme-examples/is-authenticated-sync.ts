import { OidcService } from "@hawaii-framework/oidc-implicit-core";

// If a token is stored, we can assume the user is logged in.
// This call is synchronous and will as such not influence rendering the page.
OidcService.getStoredToken();
