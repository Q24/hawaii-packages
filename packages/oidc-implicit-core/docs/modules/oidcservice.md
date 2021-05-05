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

• `Const` **OidcConfigService**: *object*

#### Type declaration:

| Name | Type |
| :------ | :------ |
| `get **config**(): [*OidcConfig*](../interfaces/oidcconfig.md)` | *object* |

Defined in: [services/config.service.ts:5](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/config.service.ts#L5)

## Functions

### checkIfTokenExpiresAndRefreshWhenNeeded

▸ **checkIfTokenExpiresAndRefreshWhenNeeded**(`token`: [*Token*](../interfaces/token.md), `tokenValidationOptions?`: [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md) & { `almostExpiredThreshold?`: *number*  }): *Promise*<boolean\>

Check if the token expires in the next *x* seconds.

If this is the case,
a silent refresh will be triggered and the Promise will resolve to `true`.

If the token does not expire within *x* seconds, the Promise will resolve
to `false` instead.

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [*Token*](../interfaces/token.md) | the token to check |
| `tokenValidationOptions?` | [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md) & { `almostExpiredThreshold?`: *number*  } | extra validations for the token |

**Returns:** *Promise*<boolean\>

Defined in: [services/session.service.ts:456](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L456)

___

### checkSession

▸ **checkSession**(`tokenValidationOptions?`: [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md)): *Promise*<[*Token*](../interfaces/token.md)\>

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

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenValidationOptions?` | [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md) | If not set, takes the tokens from the config. |

**Returns:** *Promise*<[*Token*](../interfaces/token.md)\>

A valid token

It will reject (as well as redirect) in case the check did not pass.

Defined in: [services/session.service.ts:553](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L553)

___

### cleanHashFragment

▸ **cleanHashFragment**(`url`: *string*): *string*

Strip the hash fragment from the URL.
The URL could contain an *access_token* when a user uses the *BACK* button in the browser.

#### Parameters:

| Name | Type |
| :------ | :------ |
| `url` | *string* |

**Returns:** *string*

The cleaned URL

Defined in: [utils/urlUtil.ts:89](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/utils/urlUtil.ts#L89)

___

### cleanSessionStorage

▸ **cleanSessionStorage**(): *void*

Cleans up the current session: deletes the stored local tokens, state, nonce, id token hint and CSRF token.

**Returns:** *void*

Defined in: [services/session.service.ts:39](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L39)

___

### deleteStoredTokens

▸ **deleteStoredTokens**(): *void*

Delete all tokens in sessionStorage for this session.

**Returns:** *void*

Defined in: [services/token.service.ts:16](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/token.service.ts#L16)

___

### getAuthHeader

▸ **getAuthHeader**(`token`: [*Token*](../interfaces/token.md)): *string*

Get the Authorisation header for usage with rest calls

#### Parameters:

| Name | Type |
| :------ | :------ |
| `token` | [*Token*](../interfaces/token.md) |

**Returns:** *string*

Defined in: [services/session.service.ts:439](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L439)

___

### getCsrfToken

▸ **getCsrfToken**(): *Promise*<[*CsrfToken*](../interfaces/csrftoken.md)\>

Get a CSRF Token from the authorisation server

**Returns:** *Promise*<[*CsrfToken*](../interfaces/csrftoken.md)\>

Defined in: [services/token.service.ts:213](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/token.service.ts#L213)

___

### getIdTokenHint

▸ **getIdTokenHint**(`options?`: { `regex`: *boolean* = false }): *string* \| ``null``

Get the saved id_token_hint string for the current instance from storage
Used when you need to check the if your logged in or not without using access-tokens as a reference

Pass the `{regex: true}` option, to search for any ID Token Hint by regex
During logout, the regex option should be enabled if we are not sure that the *client_id* will remain stable.

#### Parameters:

| Name | Type | Default value |
| :------ | :------ | :------ |
| `options` | *object* | - |
| `options.regex` | *boolean* | false |

**Returns:** *string* \| ``null``

Defined in: [services/token.service.ts:169](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/token.service.ts#L169)

___

### getStoredCsrfToken

▸ **getStoredCsrfToken**(): *string* \| ``null``

Gets the stored CSRF Token from storage

**Returns:** *string* \| ``null``

Defined in: [services/token.service.ts:205](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/token.service.ts#L205)

___

### getStoredToken

▸ **getStoredToken**(`tokenValidationOptions?`: [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md)): [*Token*](../interfaces/token.md) \| ``null``

Gets a valid, non-expired token from session storage for a specific set of scopes.

#### Parameters:

| Name | Type |
| :------ | :------ |
| `tokenValidationOptions?` | [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md) |

**Returns:** [*Token*](../interfaces/token.md) \| ``null``

A valid Token or `null` if no token has been found.

Defined in: [services/token.service.ts:114](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/token.service.ts#L114)

___

### isSessionAlive

▸ **isSessionAlive**(): *Promise*<{ `status`: *number*  }\>

Checks if a session is alive. This may be on another platform.
This is normally used in conjunction with a silent logout. It
doesn't extend the lifetime of the current session. If a
session is found, a logout should NOT be triggered.

**Returns:** *Promise*<{ `status`: *number*  }\>

The status code of the HTTP response

Defined in: [services/session.service.ts:55](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L55)

___

### parseJwt

▸ **parseJwt**(`token`: *string*): [*JWT*](../interfaces/jwt.md)

#### Parameters:

| Name | Type |
| :------ | :------ |
| `token` | *string* |

**Returns:** [*JWT*](../interfaces/jwt.md)

Defined in: [utils/jwtUtil.ts:3](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/utils/jwtUtil.ts#L3)

___

### silentLogoutByUrl

▸ **silentLogoutByUrl**(`url?`: *string*): *Promise*<boolean\>

Allows you to initiate a logout of the session in the background via an
iframe.

This logout will not redirect the top-level window to the logged-out page.
It is important that the result of the returning Promise is used to take
an action (e.g. do a redirect).

The logout was successful if the iframe ended up on the configured
`post_logout_redirect_uri`.

#### Parameters:

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | *string* | A URL pointing to a *page*. This *page* should make a POST request to the logout endpoint of the SSO server in an automated fashion, which will cause the user to be logged out. The `id_token_hint` and `csrf_token` will be supplied to the *page* via this function. Defaults to `OidcConfigService.config.silent_logout_uri` |

**Returns:** *Promise*<boolean\>

*true*, if the logout was successful, *false* if the logout failed.

Defined in: [services/session.service.ts:244](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L244)

___

### silentRefreshAccessToken

▸ **silentRefreshAccessToken**(`tokenValidationOptions?`: [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md)): *Promise*<[*Token*](../interfaces/token.md)\>

Silently refresh an access token via iFrame

#### Parameters:

| Name | Type |
| :------ | :------ |
| `tokenValidationOptions?` | [*TokenValidationOptions*](../interfaces/tokenvalidationoptions.md) |

**Returns:** *Promise*<[*Token*](../interfaces/token.md)\>

Defined in: [services/session.service.ts:130](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/services/session.service.ts#L130)
