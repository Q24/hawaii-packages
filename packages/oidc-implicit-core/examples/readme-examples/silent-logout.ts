import {
  cleanSessionStorage,
  silentLogout,
} from "@hawaii-framework/oidc-implicit-core";

silentLogout()
  .then(() => {
    cleanSessionStorage();
  })
  .catch(() => {
    // Handle errors when logout has failed.
  });
