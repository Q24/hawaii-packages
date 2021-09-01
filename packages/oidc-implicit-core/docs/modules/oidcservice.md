[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / OidcService

# Namespace: OidcService

## Table of contents

### Variables

- [OidcConfigService](oidcservice.md#oidcconfigservice)

### Functions

- [checkIfTokenExpiresAndRefreshWhenNeeded](oidcservice.md#checkiftokenexpiresandrefreshwhenneeded)
- [checkSession](oidcservice.md#checksession)
- [cleanHashFragment](oidcservice.md#cleanhashfragment)
- [cleanSessionStorage](oidcservice.md#cleansessionstorage)
- [deleteStoredTokens](oidcservice.md#deletestoredtokens)
- [getAuthHeader](oidcservice.md#getauthheader)
- [getCsrfToken](oidcservice.md#getcsrftoken)
- [getIdTokenHint](oidcservice.md#getidtokenhint)
- [getStoredCsrfToken](oidcservice.md#getstoredcsrftoken)
- [getStoredToken](oidcservice.md#getstoredtoken)
- [isSessionAlive](oidcservice.md#issessionalive)
- [parseJwt](oidcservice.md#parsejwt)
- [silentLogoutByUrl](oidcservice.md#silentlogoutbyurl)
- [silentRefreshAccessToken](oidcservice.md#silentrefreshaccesstoken)

## Variables

### OidcConfigService

• `Const` **OidcConfigService**: `Object`

A service containing the config

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| ``get` **config**(): [`OidcConfig`](../interfaces/oidcconfig.md)` | `Object` | Get the global OIDC config |

#### Defined in

[services/config.service.ts:8](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/config.service.ts#L8)

## Functions

### checkIfTokenExpiresAndRefreshWhenNeeded

▸ **checkIfTokenExpiresAndRefreshWhenNeeded**(`token`, `tokenValidationOptions?`): `Promise`<`void`\>

Check if the token expires in the next *x* seconds.

If this is the case,
a silent refresh will be triggered and the Promise will resolve to `true`.

If the token does not expire within *x* seconds, the Promise will resolve
to `false` instead.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`Token`](../interfaces/token.md) | the token to check |
| `tokenValidationOptions?` | [`TokenValidationOptions`](../interfaces/tokenvalidationoptions.md) & { `almostExpiredThreshold?`: `number`  } | extra validations for the token |

#### Returns

`Promise`<`void`\>

A promise. May throw and error if the token
we got from the refresh is not valid.

#### Defined in

[services/session.service.ts:502](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L502)

___

### checkSession

▸ **checkSession**(`tokenValidationOptions?`): `Promise`<[`Token`](../interfaces/token.md)\>

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

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenValidationOptions?` | [`TokenValidationOptions`](../interfaces/tokenvalidationoptions.md) | If not set, takes the tokens from the config. |

#### Returns

`Promise`<[`Token`](../interfaces/token.md)\>

A valid token

It will reject (as well as redirect) in case the check did not pass.

#### Defined in

[services/session.service.ts:599](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L599)

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

[utils/urlUtil.ts:92](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/utils/urlUtil.ts#L92)

___

### cleanSessionStorage

▸ **cleanSessionStorage**(): `void`

Cleans up the current session: deletes the stored local tokens, state, nonce, id token hint and CSRF token.

#### Returns

`void`

#### Defined in

[services/session.service.ts:39](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L39)

___

### deleteStoredTokens

▸ **deleteStoredTokens**(`tokenFilter?`): `void`

Deletes all the tokens from the storage.
If tokenFilter is passed in, only a subset will be deleted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenFilter?` | (`token`: `Readonly`<[`Token`](../interfaces/token.md)\>) => `boolean` | if specified, the custom token validator is called for every token in the store. If a tokenFilter callback returns true, the token will remain in the store. Otherwise, it will be deleted (Just like Array.prototype.filter()) |

#### Returns

`void`

#### Defined in

[services/token.service.ts:22](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/token.service.ts#L22)

___

### getAuthHeader

▸ **getAuthHeader**(`token`): `string`

Get the Authorisation header for usage with rest calls.

Uses the token type present in the token.

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | [`Token`](../interfaces/token.md) |

#### Returns

`string`

#### Defined in

[services/session.service.ts:484](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L484)

___

### getCsrfToken

▸ **getCsrfToken**(): `Promise`<[`CsrfToken`](../interfaces/csrftoken.md)\>

Get a CSRF Token from the authorisation server

#### Returns

`Promise`<[`CsrfToken`](../interfaces/csrftoken.md)\>

#### Defined in

[services/token.service.ts:242](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/token.service.ts#L242)

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

[services/token.service.ts:198](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/token.service.ts#L198)

___

### getStoredCsrfToken

▸ **getStoredCsrfToken**(): `string` \| ``null``

Gets the stored CSRF Token from storage

#### Returns

`string` \| ``null``

#### Defined in

[services/token.service.ts:234](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/token.service.ts#L234)

___

### getStoredToken

▸ **getStoredToken**(`tokenValidationOptions?`): [`Token`](../interfaces/token.md) \| ``null``

Gets a valid, non-expired token from session storage given a set of validators.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenValidationOptions?` | [`TokenValidationOptions`](../interfaces/tokenvalidationoptions.md) | the required scopes and other validators |

#### Returns

[`Token`](../interfaces/token.md) \| ``null``

A valid Token or `null` if no token has been found.

#### Defined in

[services/token.service.ts:146](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/token.service.ts#L146)

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

[services/session.service.ts:56](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L56)

___

### parseJwt

▸ **parseJwt**(`token`): [`JWT`](../interfaces/jwt.md)

transforms an JWT string (e.g. from an access token) to a
JWT object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | A JWT token string |

#### Returns

[`JWT`](../interfaces/jwt.md)

JSON Web Token

#### Defined in

[utils/jwtUtil.ts:10](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/utils/jwtUtil.ts#L10)

___

### silentLogoutByUrl

▸ **silentLogoutByUrl**(`url?`): `Promise`<`void`\>

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
| `url` | `string` | A URL pointing to a *page*. This *page* should make a POST request to the logout endpoint of the SSO server in an automated fashion, which will cause the user to be logged out. The `id_token_hint` and `csrf_token` will be supplied to the *page* via this function. Defaults to `silent_logout_uri` from the config. |

#### Returns

`Promise`<`void`\>

The promise resolves if the logout was successful, otherwise it will reject.

#### Defined in

[services/session.service.ts:276](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L276)

___

### silentRefreshAccessToken

▸ **silentRefreshAccessToken**(`tokenValidationOptions?`): `Promise`<[`Token`](../interfaces/token.md)\>

Silently refresh an access token via iFrame.

Concurrent requests to this function will resolve to a
singleton Promise.

Creates an invisible iframe that navigates to the
`authorize_endpoint` to get a new token there. Extracts
the token from the iframe URL and returns it.

If this function fails for any reason, the Promise will reject.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenValidationOptions?` | [`TokenValidationOptions`](../interfaces/tokenvalidationoptions.md) | The options that a token is tested for |

#### Returns

`Promise`<[`Token`](../interfaces/token.md)\>

A valid token

#### Defined in

[services/session.service.ts:158](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/services/session.service.ts#L158)
