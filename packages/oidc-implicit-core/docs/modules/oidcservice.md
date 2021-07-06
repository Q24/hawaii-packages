[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / OidcService

# Namespace: OidcService

## Table of contents

### Variables

- [OidcConfigService](oidcservice.md#oidcconfigservice)

### Functions

- [checkSession](oidcservice.md#checksession)
- [cleanHashFragment](oidcservice.md#cleanhashfragment)
- [cleanSessionStorage](oidcservice.md#cleansessionstorage)
- [deleteAuthResults](oidcservice.md#deleteauthresults)
- [getAuthHeader](oidcservice.md#getauthheader)
- [getCsrfResult](oidcservice.md#getcsrfresult)
- [getIdTokenHint](oidcservice.md#getidtokenhint)
- [getStoredAuthResult](oidcservice.md#getstoredauthresult)
- [getStoredCsrfToken](oidcservice.md#getstoredcsrftoken)
- [getUserInfo](oidcservice.md#getuserinfo)
- [isSessionAlive](oidcservice.md#issessionalive)
- [lazyRefresh](oidcservice.md#lazyrefresh)
- [parseJwt](oidcservice.md#parsejwt)
- [silentLogout](oidcservice.md#silentlogout)
- [silentRefresh](oidcservice.md#silentrefresh)

## Variables

### OidcConfigService

• `Const` **OidcConfigService**: `Object`

A service containing the config

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| ``get` **config**(): [`OidcConfig`](../interfaces/oidcconfig.md)` | `Object` | Get the global OIDC config |

#### Defined in

[configuration/config.service.ts:8](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/config.service.ts#L8)

## Functions

### checkSession

▸ **checkSession**(`authValidationOptions?`): `Promise`<`AuthResult`\>

Checks if there is a session available.
If this is not available, redirect to the authorisation page.

Before starting with checks, we flush state if needed (in case of session upgrade i.e.)
1. If there is a valid session storage token, we are done.
2. Else, if we may refresh in the background, try to do that.
3. Else, if there is an *access_token* in the URL;
  - a. Validate that the state from the response is equal to the state previously generated on the client.
  - b. Validate token from URL with Backend
  - c. Store the token
  - d. Get a new CSRF token from Authorisation with the newly created session, and save it for i.e. logout usage
4. Check if there's a session_upgrade_token in the URL, if so, call the session upgrade function
5. Nothing found anywhere, so redirect to authorisation

#### Parameters

| Name | Type |
| :------ | :------ |
| `authValidationOptions?` | `AuthValidationOptions` |

#### Returns

`Promise`<`AuthResult`\>

A valid token

It will reject (as well as redirect) in case the check did not pass.

#### Defined in

[authentication/check-session.ts:41](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/check-session.ts#L41)

___

### cleanHashFragment

▸ **cleanHashFragment**(`url`): `string`

Based on a URL containing a hash fragment, gets a new URL without this fragment.

Useful if the URL contains a hash fragment which should be stripped. URL could contain
an *access_token* when a user uses the *BACK* button in the browser.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | the URL containing the hash fragment |

#### Returns

`string`

the URL without the hash fragment

#### Defined in

[utils/urlUtil.ts:106](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/utils/urlUtil.ts#L106)

___

### cleanSessionStorage

▸ **cleanSessionStorage**(): `void`

Cleans up the current session: deletes the stored local tokens, state, nonce,
id token hint and CSRF token.

#### Returns

`void`

#### Defined in

[utils/clean-storage.ts:12](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/utils/clean-storage.ts#L12)

___

### deleteAuthResults

▸ **deleteAuthResults**(`authResultFilter?`): `void`

Deletes all the tokens from the storage.
If tokenFilter is passed in, only a subset will be deleted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `authResultFilter?` | (`authResult`: `Readonly`<`AuthResult`\>) => `boolean` | if specified, the custom token validator is called for every token in the store. If a tokenFilter callback returns true, the token will remain in the store. Otherwise, it will be deleted (Just like Array.prototype.filter()) |

#### Returns

`void`

#### Defined in

[authentication/utils/auth-result.ts:20](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/utils/auth-result.ts#L20)

___

### getAuthHeader

▸ **getAuthHeader**(`authResult`): `string`

Get the Authorisation header for usage with rest calls.

Uses the token type present in the token.

#### Parameters

| Name | Type |
| :------ | :------ |
| `authResult` | `AuthResult` |

#### Returns

`string`

#### Defined in

[authentication/utils/auth-header.ts:8](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/utils/auth-header.ts#L8)

___

### getCsrfResult

▸ **getCsrfResult**(): `Promise`<`CsrfResult`\>

Get a CSRF Token from the authorisation server

#### Returns

`Promise`<`CsrfResult`\>

#### Defined in

[csrf/csrf.ts:25](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/csrf/csrf.ts#L25)

___

### getIdTokenHint

▸ **getIdTokenHint**(`options?`): `string` \| ``null``

Get the saved id_token_hint string for the current instance from storage
Used when you need to check the if your logged in or not without using access-tokens as a reference

Pass the `{regex: true}` option, to search for any ID Token Hint by regex
During logout, the regex option should be enabled if we are not sure that the *client_id* will remain stable.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `options` | `Object` | `undefined` |
| `options.regex` | `boolean` | `false` |

#### Returns

`string` \| ``null``

#### Defined in

[authentication/utils/id-token-hint.ts:15](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/utils/id-token-hint.ts#L15)

___

### getStoredAuthResult

▸ **getStoredAuthResult**(`authResultFilters?`): `AuthResult` \| ``null``

Gets a valid, non-expired token from session storage given a set of validators.

#### Parameters

| Name | Type |
| :------ | :------ |
| `authResultFilters?` | `AuthResultFilter`[] |

#### Returns

`AuthResult` \| ``null``

A valid Token or `null` if no token has been found.

#### Defined in

[authentication/utils/auth-result.ts:95](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/utils/auth-result.ts#L95)

___

### getStoredCsrfToken

▸ **getStoredCsrfToken**(): `string` \| ``null``

Gets the stored CSRF Token from storage

#### Returns

`string` \| ``null``

#### Defined in

[csrf/csrf.ts:17](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/csrf/csrf.ts#L17)

___

### getUserInfo

▸ **getUserInfo**(): `Promise`<`UserInfo`\>

tries to get the local user info; if not found, get the remote user info.

#### Returns

`Promise`<`UserInfo`\>

the user info

#### Defined in

[user-info/getUserInfo.ts:125](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/user-info/getUserInfo.ts#L125)

___

### isSessionAlive

▸ **isSessionAlive**(): `Promise`<`Object`\>

Checks if a session is alive. This may be on another platform.
This is normally used in conjunction with a silent logout. It
doesn't extend the lifetime of the current session. If a
session is found, a logout should NOT be triggered.

#### Returns

`Promise`<`Object`\>

The status code of the HTTP response

#### Defined in

[backend-check/session-alive.ts:13](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/backend-check/session-alive.ts#L13)

___

### lazyRefresh

▸ **lazyRefresh**(`authResult`, `tokenValidationOptions?`): `Promise`<`void`\>

Check if the token expires in the next *x* seconds.

If this is the case, a silent refresh will be triggered and the Promise will
resolve to `true`.

If the token does not expire within *x* seconds, the Promise will resolve to
`false` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `authResult` | `AuthResult` | the token to check |
| `tokenValidationOptions?` | `AuthValidationOptions` & { `almostExpiredThreshold?`: `number`  } | extra validations for the token |

#### Returns

`Promise`<`void`\>

A promise. May throw an error if the token we got from the refresh
is not valid.

#### Defined in

[authentication/lazy-refresh.ts:19](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/lazy-refresh.ts#L19)

___

### parseJwt

▸ **parseJwt**<`T`\>(`token`): [`JWT`](../interfaces/jwt.md)<`T`\>

transforms an JWT string (e.g. from an access token) to a
JWT object.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `AccessTokenPayload` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | A JWT token string |

#### Returns

[`JWT`](../interfaces/jwt.md)<`T`\>

JSON Web Token

#### Defined in

[jwt/parseJwt.ts:27](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/jwt/parseJwt.ts#L27)

___

### silentLogout

▸ **silentLogout**(`url?`): `Promise`<`void`\>

Allows you to initiate a logout of the session in the background via an
iframe.

This logout will not redirect the top-level window to the logged-out page.
It is important that the result of the returning Promise is used to take
an action (e.g. do a redirect to the logout page).

The logout was successful if the iframe ended up on the configured
`post_logout_redirect_uri`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `undefined` \| `string` | A URL pointing to a *page*. This *page* should make a POST request to the logout endpoint of the SSO server in an automated fashion, which will cause the user to be logged out. The `id_token_hint` and `csrf_token` will be supplied to the *page* via this function. Defaults to `silent_logout_uri` from the config. |

#### Returns

`Promise`<`void`\>

The promise resolves if the logout was successful, otherwise it will reject.

#### Defined in

[authentication/silent-logout.ts:29](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/silent-logout.ts#L29)

___

### silentRefresh

▸ **silentRefresh**(`authValidationOptions?`): `Promise`<`AuthResult`\>

Silently refresh an access token via iFrame.

Concurrent requests to this function will resolve to a
singleton Promise.

Creates an invisible iframe that navigates to the
`authorize_endpoint` to get a new token there. Extracts
the token from the iframe URL and returns it.

If this function fails for any reason, the Promise will reject.

#### Parameters

| Name | Type |
| :------ | :------ |
| `authValidationOptions?` | `AuthValidationOptions` |

#### Returns

`Promise`<`AuthResult`\>

A valid token

#### Defined in

[authentication/silent-refresh.ts:47](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/authentication/silent-refresh.ts#L47)
