import { OidcService } from "@hawaii-framework/oidc-implicit-core";

async function processProtectedRoute(): Promise<void> {
  try {
    await OidcService.checkSession();
    // We may proceed
  } catch (error) {
    return;
  }
}
