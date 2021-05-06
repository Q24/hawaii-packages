import { OidcService } from "@hawaii-framework/oidc-implicit-core";

// The LOGOUT_ENDPOINT can be requested from
OidcService.OidcConfigService.config.logout_endpoint;

// The POST_LOGOUT_REDIRECT_URI can be requested from
OidcService.OidcConfigService.config.post_logout_redirect_uri;

// The CSRF_TOKEN can be requested from
//  Synchronously (try this first)
OidcService.getStoredCsrfToken()
//  Asynchronously
OidcService.getCsrfToken();

// The ID_TOKEN_HINT can be requested from
OidcService.getIdTokenHint({ regex: true });
