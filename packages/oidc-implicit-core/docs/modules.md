[@hawaii-framework/oidc-implicit-core](README.md) / Exports

# @hawaii-framework/oidc-implicit-core

## Table of contents

### Namespaces

- [OidcService](modules/oidcservice.md)

### Classes

- [LogUtil](classes/logutil.md)

### Interfaces

- [CsrfToken](interfaces/csrftoken.md)
- [JWT](interfaces/jwt.md)
- [OidcConfig](interfaces/oidcconfig.md)
- [Token](interfaces/token.md)
- [TokenValidationOptions](interfaces/tokenvalidationoptions.md)

### Type aliases

- [AuthorizeErrors](modules.md#authorizeerrors)

### Variables

- [AUTHORIZE\_ERRORS](modules.md#authorize_errors)

## Type aliases

### AuthorizeErrors

Ƭ **AuthorizeErrors**: ``"invalid_client"`` \| ``"unauthorized_client"`` \| ``"invalid_grant"`` \| ``"unsupported_grant_type"`` \| ``"invalid_scope"`` \| ``"invalid_request_response_type"`` \| ``"invalid_request_type"`` \| ``"invalid_request_openid_type"`` \| ``"invalid_request_redirect_uri"`` \| ``"invalid_request_signature"`` \| ``"invalid_request_realm"`` \| ``"invalid_request_atype"`` \| ``"invalid_request_recipient"``

A set of strings to match when the Authorize redirect is erroring. This is the complete list of possible error to handle.

Defined in: [models/url-param.models.ts:63](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/models/url-param.models.ts#L63)

## Variables

### AUTHORIZE\_ERRORS

• `Const` **AUTHORIZE\_ERRORS**: [*AuthorizeErrors*](modules.md#authorizeerrors)[]

Defined in: [constants/authorize.constants.ts:3](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/constants/authorize.constants.ts#L3)
