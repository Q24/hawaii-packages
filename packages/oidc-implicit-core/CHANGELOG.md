# CHANGELOG

### 2.0.0

#### CHANGED:

- `silentRefreshAccessToken`
  - **BREAKING**: now returns a `Promise of type Token` instead of a `Promise of type boolean` (which described whether or not the refresh failed). The new Promise will resolve to a token if the refresh succeeds and will otherwise be rejected.
  - Added a parameter to select a token which has specific scopes or other token attributes.
- `silentLogoutByUrl`
  - **BREAKING**: now returns a `Promise of type void` instead of a `Promise of type boolean` (which described whether or not the refresh failed). The new Promise will resolve if the refresh succeeds and will otherwise be rejected.
- `checkIfTokenExpiresAndRefreshWhenNeeded`
  - **BREAKING**: now returns a `Promise of type void` instead of a `Promise of type boolean` (which described whether or not the refresh was needed). The new Promise will resolve if the refresh succeeds and will otherwise be rejected.
  - **BREAKING**: the parameters now have an optional `tokenValidationOptions` parameter and overall changed parameters the default threshold of 300 remains unchanged:
    ```ts
    // Before
    checkIfTokenExpiresAndRefreshWhenNeeded(almostExpiredTreshhold = 300, token: Token): Promise<boolean>
    ```
    ```ts
    // After
    checkIfTokenExpiresAndRefreshWhenNeeded(
      token: Token,
      tokenValidationOptions?: TokenValidationOptions & {
        almostExpiredThreshold?: number;
      },
    ): Promise<void>
    ```
- `checkSession`
  - **BREAKING**: returns a `Promise of type Token` instead of a `Promise of type boolean` (which described whether or not the the was successful). The new Promise will resolve to a token if the check succeeds and will otherwise be rejected AND redirect the browser to the login page.
  - Added a parameter to select a token which has specific scopes or other token attributes.
- `getStoredToken`
  - Added an option to select a token which has specific scopes or other token attributes.
- `deleteStoredTokens`
  - Added an option to filter the tokens which will be deleted.
- Bundling of the package has changed

  - **BREAKING**: This breaks existing implementations as the imports have changed.

    - Most functions are now located in the new OIDC service.
    - The new import does not require using the `dist` directory.

    ```ts
    // Before
    import {
      CsrfToken,
      OidcConfig,
      SessionService,
      SessionUtil,
      StorageUtil,
      Token,
      TokenService,
    } from "@hawaii-framework/oidc-implicit-core/dist";
    import configService from "@hawaii-framework/oidc-implicit-core/dist/services/config.service";
    ```

    ```ts
    // After
    import {
      OidcService,
      OidcConfig,
      CsrfToken,
      Token,
    } from "@hawaii-framework/oidc-implicit-core";
    ```

- Improved documentation
- General refactor of APIs

### ADDED:

- `getStoredCsrfToken`
  - Can be used to get the previously stored csrf token from the storage in a synchronous manner.
- API reference

### 1.2.0

- Add `CodeBasedLoginConfig` to `OidcConfig` for email based logins.

### 1.1.2

- IE11 Fix for URLSearchParams (refactor, so no polyfill is needed)
- Remove flush_state param from URL, so it only gets triggered once

### 1.1.1

- Regex based removing from local storage
- Regex based getItem for ID Token Hint
- Fixed debug mode in Storage util
- Refactored Provider ID based token scoping with Client ID token scoping in storage
