@hawaii-framework/oidc-implicit-core / [Exports](modules.md)

# OIDC Implicit Core

This library implements the [OIDC implicit flow](https://openid.net/specs/openid-connect-implicit-1_0.html) for use in a front-end web application. The library can be used directly with any framework of choice. While it is not strictly necessary to use wrapper, there is one [available for Angular](https://github.com/Q24/hawaii-packages/tree/master/packages/ngx-oidc-implicit).

## Roadmap

* A future aim is to have this library certified as [OpenID Relying Party Implicit](https://openid.net/certification/#RPs).
* Add support for [all request parameters](https://openid.net/specs/openid-connect-implicit-1_0.html#RequestParameters).
* Add support for [Code Flow](https://openid.net/specs/openid-connect-basic-1_0.html#CodeFlow).
* Add support for [Code Flow with PKCE](https://developers.onelogin.com/openid-connect/guides/auth-flow-pkce).

## API Reference

The API reference can be found in the `docs folder`.

## How to set the OIDC Config

```ts
import { OidcConfig, OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.OidcConfigService.config = {
  authorisation: "",
  client_id: "",
  ...etc,
};
```

## How to set the Auth headers on API requests

To access resources, a request may need to include authentication information. This is done via te authorization header. Take caution that you only include this header in requests for protected resources; simply including the header in every request is a security risk.

In the following example, we use axios' request interceptors to add this authorization header. With axios, you may create various axios instances with different interceptors to deal with this. With other implementations, you may need to include headers at a request level.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";
import axios, { AxiosRequestConfig } from "axios";

const setAuthHeader = async (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> => {
  const storedToken = OidcService.getStoredToken();

  if (storedToken) {
    config.headers["Authorization"] = OidcService.getAuthHeader(storedToken);

    // For info see Token Expiration section in Readme
    if (
      (storedToken.expires || 0) - Math.round(new Date().getTime() / 1000.0) <
      300
    ) {
      OidcService.silentRefreshAccessToken();
    }
    return config;
  } else {
    // The check session method will either return
    // that the user is indeed logged in, or redirect
    // the user to the login page. This redirection
    // will be triggered automatically by the library.
    const isLoggedIn = await OidcService.checkSession();
    if (isLoggedIn) {
      config = await setAuthHeader(config);`
      return config;
    } else {
      throw new axios.Cancel("User is not logged in");
    }
  }
};

// Add a request interceptor
axios.interceptors.request.use(setAuthHeader, (error) => {
  Promise.reject(error);
});
```

## How do I check if the user is authenticated?

On a page level, users should be redirected if they are not authenticated. For this, you can use the check session method. Do note that this method returns a Promise.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

async function processProtectedRoute(): Promise<void> {
  try {
    await OidcService.checkSession();
    // We may proceed
  } catch (error) {
    // Under normal circumstances, we will never get here, as the checkSession will already have redirected us to the login page in case the authenticated fails.
    return;
  }
}
```

On a component level, you need to make sure at least a token is stored

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

// If a token is stored, we can assume the user is logged in.
// This call is synchronous and will as such not influence rendering the page.
OidcService.getStoredToken();
```

## Token expiration

Often times, the access token is set to expire after a certain period. Before this period is over, we can still request a new token. The renewal of a token should only take place as long as the user continues to use the application. If the application renews tokens without paying attention to user activity, it is a potential threat to the security of the user's information.

A common way to detect application usage is to hook into requests that have been authenticated. These are either requests to the backend API (i.e. requests to protected resources) or front-end navigation to routes that require authentication. In addition, the necessity of creating a new token must be considered. If the expiration time is still far in the future, it should be decided not to renew the token yet.

```ts
import { OidcService, Token } from "@hawaii-framework/oidc-implicit-core";
import { AxiosRequestConfig } from "axios";

const refreshTokenAboutToExpire = (token?: Token) => {
  if (
    token &&
    // The expiry time is calculated in seconds since 1970
    // Check if the token expires in the next 5 minutes, if so, trigger a
    // silent refresh of the Access Token in the OIDC Service
    (token.expires || 0) - Date.now() / 1000 < 300
  ) {
    OidcService.silentRefreshAccessToken();
  }
};

// ==================================================
// == SOMEWHERE IN THE ROUTER AUTHENTICATION CHECK ==
// ==================================================
OidcService.checkSession().then((token) => {
  if (token) {
    // If the authentication was successful, we request
    // a new token (if it is about to expire).
    refreshTokenAboutToExpire(token);

    // Returning the auth check result here...
  }
});

// =================================
// == SOMEWHERE IN AN API REQUEST ==
// =================================
const storedToken = OidcService.getStoredToken();
const config: AxiosRequestConfig = {};
if (storedToken) {
  config.headers["Authorization"] = OidcService.getAuthHeader(storedToken);
  // After adding the headers, we request
  // a new token (if it is about to expire).
  refreshTokenAboutToExpire(storedToken);
}
```

## Login

The login consists of two steps. Step 1 is to send authentication data to the server (_username_ and _password_ and _csrf token_). Step 2 is processing the response from the server.

### Sending authentication data to the server

Most of the time, it is not needed to create a custom login page. The default page of the CIAM server can be used. The client id can be used by CIAM to determine which login page should be served.

If you are going to create a custom CIAM login page, you need to make sure that besides the username and password, you also send a Cross Site Request Forgery token (csrf) to the SSO server. This can be obtained with the `getCsrfToken()` method.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.getCsrfToken();
```

### Processing the response from the server

An auth token will be present in a response from the server after a successful login. This token must be stored on the user's local computer. The auth token is present in the hash fragment of the redirect url from the server to the client. So, you need to make sure you will not clear the URL before saving it locally.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

async function calledWhenTryingToAuthenticateUser() {
  // The check session method is used for both checking if the user is logged in
  // as well as saving the access token present in the URL hash.
  // After the URL has been saved, it will be cleared.
  await OidcService.checkSession();
}
```

The current implementation of the redirect from the server only goes to a single URL. This means that restoring the user session (the url where the user was before logging in) is a responsibility of the front-end. Take into account that routes which do not require authentication should not call the check session function (as it will trigger a login).

Because the check session function is used both for the login check and to store the token, it is recommended to do a front-end redirect where the URL hash is kept intact before the check session is used to store the token. This way the user is sent to the correct route after login, which calls the check session anyway (to check if the user is logged in) and consequently also stores the token.

![Login flow](images/login-flow.png)

## Logout

The logout form needs a **logout endpoint**, a Cross Site Request Forgery Token (**\_csrf**), a URL to redirect to after the logout has succeeded (**post_logout_redirect_uri**) and an ID Token (**id_token_hint**). The form can be submitted in an automated fashion after all inputs have been set. If the _\_csrf_ or _id_token_hint_ cannot be resolved, an error page should be shown.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

// The LOGOUT_ENDPOINT can be requested from
OidcService.OidcConfigService.config.logout_endpoint;

// The POST_LOGOUT_REDIRECT_URI can be requested from
OidcService.OidcConfigService.config.post_logout_redirect_uri;

// The CSRF_TOKEN can be requested from
//  Synchronously (try this first)
OidcService.getStoredCsrfToken();
//  Asynchronously
OidcService.getCsrfToken();

// The ID_TOKEN_HINT can be requested from
OidcService.getIdTokenHint({ regex: true });
```

```html
<form method="POST" action="LOGOUT_ENDPOINT">
  <input type="hidden" name="_csrf" value="CSRF_TOKEN" />

  <input
    type="hidden"
    name="post_logout_redirect_uri"
    value="POST_LOGOUT_REDIRECT_URI"
  />

  <input type="hidden" name="id_token_hint" value="ID_TOKEN_HINT" />
</form>
```

## Automatic logout

If the session is closed due to inactivity, the user must be logged out to protect the data still on the local computer from access by unauthorised parties. After redirecting to the logged out page, the authentication information will be removed.

In the case a user may still be logged in on another client, they should not be logged out. This is what the isSessionAlive call is for. It checks the server to see if the user is still logged in somewhere. Logging out would also destroy the session for other clients. This would cause these users to eventually be rejected when requesting a renewal of the session, even though they might still be actively using the session.

The `isSessionAlive` call does not count as user activity, and will as such not lengthen the session.

```ts
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
```

## Logged out page

See the FAQ for the difference between a logout page and a logged out page.

The logged out page is used to show the user that he has been logged out. Next to this, it should remove local authentication information. This includes local storage on the current domain as well as cookies on other domains via a logout pixel.

### Clean up

Remove possible left-overs of the previous session.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

// Upon opening the logged out page
OidcService.cleanSessionStorage();
```

### Logout pixel

> ! This is an opinionated way of handling logout.

In case there multiple domains that need to be logged out at once, you may choose to include logout pixels. With a logout pixel, you include an invisible iframe or image on the site which is hosted on another domain. The embedded element contains some logic to logout on the hosting domain. In this way the same domain policy for cookies and other local ways authentication data storage can be circumvented.
![Logout pixel flow](images/logout-pixel.png)

```html
<!-- As iframe -->
<iframe
  src="https://example.com/logoutpixel"
  width="0"
  height="0"
  class="hidden"
></iframe>

<!-- As img -->
<img
  src="https://example.com/logoutpixel"
  width="0"
  height="0"
  class="hidden"
/>
```

If you are creating a logout pixel, you need to:

1.  Make an array of all access tokens in the session storage
    1.  Call the logout endpoint with each token
    1.  Remove the token from session storage
1.  Remove the `_csrf` token from session storage

## Custom validators

It is possible to write a custom validator for a token. This validator will be used to get a valid token from the token store (a list of all previously saved tokens). This is useful if the tokens you are using have some non-standard behaviour.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.getStoredToken({
  customTokenValidator: (token) => {
    if (token.access_token) {
      const accessToken = OidcService.parseJwt(token.access_token);
      // The backend is creating special tokens which have `someCustomProperty` set
      // to an expected value. We need to validate this.
      return accessToken["someCustomProperty"] === "someExpectedValue";
    }
    return false;
  },
});
```

## FAQ

### What is a silent logout?

With a silent logout, you are logged out in the background. This means that you are not redirected to a logged-out page. However, the access token will be invalidated. You would use this when you need the user to be logged out in order to perform a certain action. If you are going to use this method, be sure to clean the session storage afterwards.

```ts
import { OidcService } from "@hawaii-framework/oidc-implicit-core";

OidcService.silentLogoutByUrl().then((loggedOut) => {
  if (loggedOut) {
    OidcService.cleanSessionStorage();

});

```

### What is a silent refresh?

With a silent refresh, the lifetime of a token is renewed in the background, without user interaction. The Authorization Server will not display any authentication or consent user interface pages. An error is returned if an End-User is not already authenticated. For more info, see the [OpenID Connect Core spec](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest).

### What is the difference between a logout page and a logged out page?

- The purpose of a **logout page** is to initiate and authorise the termination of a session.
- The purpose of a **logged out page** is to show the user that he has been logged out. In addition, the **logged out page** is used to remove authentication information.
