import { OidcService } from "@hawaii-framework/oidc-implicit-core/dist";

const autoLogoutInterval = setInterval(() => {
  // Get stored token either returns a non-expired token or null
  const storedToken = OidcService.getStoredToken();

  if (!storedToken) {
    OidcService.isSessionAlive().catch(() => {
      // If we are not logged in, no expired check is needed.
      clearInterval(autoLogoutInterval);

      // Remove user information that may exist next to the auth information
      clearUserInformation();

      // You may set a session restore URL here to be used on the
      // login page.
      setSessionRestoreUrl();

      // Navigate to the logged out page via the router.
      navigateToLoggedOutPage();
    });
  }
}, 15000);
