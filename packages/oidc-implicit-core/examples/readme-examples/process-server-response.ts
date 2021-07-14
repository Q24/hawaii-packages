import { checkSession } from "@hawaii-framework/oidc-implicit-core";

async function calledWhenTryingToAuthenticateUser() {
  // The check session method is used for both checking if the user is logged in
  // as well as saving the access token present in the URL hash.
  // After the URL has been saved, it will be cleared.
  await checkSession();
}
