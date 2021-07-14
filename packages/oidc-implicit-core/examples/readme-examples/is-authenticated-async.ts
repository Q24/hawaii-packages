import { checkSession } from "@hawaii-framework/oidc-implicit-core";

async function processProtectedRoute(): Promise<void> {
  try {
    await checkSession();
    // We may proceed
  } catch (error) {
    // Under normal circumstances, we will never get here, as the
    // checkSession will already have redirected us to the login page in
    // case the authenticated fails.
    return;
  }
}
