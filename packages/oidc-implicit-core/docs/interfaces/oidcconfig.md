[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / OidcConfig

# Interface: OidcConfig

Config Object for OIDC Service

## Table of contents

### Properties

- [client\_id](oidcconfig.md#client_id)
- [csrf\_token\_endpoint](oidcconfig.md#csrf_token_endpoint)
- [debug](oidcconfig.md#debug)
- [defaultAuthResultFilters](oidcconfig.md#defaultauthresultfilters)
- [is\_session\_alive\_endpoint](oidcconfig.md#is_session_alive_endpoint)
- [issuedAtMaxOffset](oidcconfig.md#issuedatmaxoffset)
- [issuer](oidcconfig.md#issuer)
- [login\_hint](oidcconfig.md#login_hint)
- [logout\_endpoint](oidcconfig.md#logout_endpoint)
- [post\_logout\_redirect\_uri](oidcconfig.md#post_logout_redirect_uri)
- [redirect\_uri](oidcconfig.md#redirect_uri)
- [response\_type](oidcconfig.md#response_type)
- [scope](oidcconfig.md#scope)
- [silent\_logout\_uri](oidcconfig.md#silent_logout_uri)
- [silent\_refresh\_uri](oidcconfig.md#silent_refresh_uri)
- [trusted\_audiences](oidcconfig.md#trusted_audiences)
- [validate\_token\_endpoint](oidcconfig.md#validate_token_endpoint)

## Properties

### client\_id

• **client\_id**: `string`

Set the ID of your client

#### Defined in

[configuration/model/config.model.ts:10](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L10)

___

### csrf\_token\_endpoint

• `Optional` **csrf\_token\_endpoint**: `string`

CSRF token endpoint

#### Defined in

[configuration/model/config.model.ts:47](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L47)

___

### debug

• `Optional` **debug**: `boolean`

Verbose logging of inner workings of the package.

#### Defined in

[configuration/model/config.model.ts:67](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L67)

___

### defaultAuthResultFilters

• `Optional` **defaultAuthResultFilters**: `AuthResultFilter`[]

A list of filters each auth result must adhere to.

#### Defined in

[configuration/model/config.model.ts:89](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L89)

___

### is\_session\_alive\_endpoint

• `Optional` **is\_session\_alive\_endpoint**: `string`

Endpoint for checking if a session is still used somewhere

#### Defined in

[configuration/model/config.model.ts:57](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L57)

___

### issuedAtMaxOffset

• `Optional` **issuedAtMaxOffset**: `number`

The maximum time to pass between the issuance and consumption of an
authentication result.

#### Defined in

[configuration/model/config.model.ts:79](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L79)

___

### issuer

• **issuer**: `string`

The base issuer URL.

#### Defined in

[configuration/model/config.model.ts:84](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L84)

___

### login\_hint

• `Optional` **login\_hint**: `string`

Hint to the Authorization Server about the login identifier the End-User
might use to log in (if necessary). This hint can be used by a Relying
Party (RP) if it first asks the End-User for their e-mail address (or other
identifier) and then wants to pass that value as a hint to the discovered
authorization service. It is RECOMMENDED that the hint value match the
value used for discovery. This value MAY also be a phone number in the
format specified for the `phone_number` Claim. The use of this parameter is
left to the OpenID Provider's discretion.

#### Defined in

[configuration/model/config.model.ts:101](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L101)

___

### logout\_endpoint

• **logout\_endpoint**: `string`

`POST` to this endpoint in the logout form

#### Defined in

[configuration/model/config.model.ts:62](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L62)

___

### post\_logout\_redirect\_uri

• **post\_logout\_redirect\_uri**: `string`

The URL you want to be redirected to after logging out

#### Defined in

[configuration/model/config.model.ts:36](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L36)

___

### redirect\_uri

• **redirect\_uri**: `string`

The URL you want to be redirected to after redirect from Authorization

#### Defined in

[configuration/model/config.model.ts:21](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L21)

___

### response\_type

• **response\_type**: ``"id_token"`` \| ``"id_token token"``

What type of token(s) you wish to receive
In case op Open Id Connect this is usually `token id_token`

#### Defined in

[configuration/model/config.model.ts:16](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L16)

___

### scope

• **scope**: `string`

Define the scopes you want access to. Each scope is separated by space.
When using Open Id Connect, scope `openid` is mandatory

#### Defined in

[configuration/model/config.model.ts:42](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L42)

___

### silent\_logout\_uri

• `Optional` **silent\_logout\_uri**: `string`

The URL you want to use for a silent Logout, if your stack supports it.

#### Defined in

[configuration/model/config.model.ts:31](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L31)

___

### silent\_refresh\_uri

• `Optional` **silent\_refresh\_uri**: `string`

The URL you want to be redirected to after redirect from Authorization, while doing a silent access token refresh

#### Defined in

[configuration/model/config.model.ts:26](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L26)

___

### trusted\_audiences

• `Optional` **trusted\_audiences**: `string`[]

Audiences (client_ids) other than the current client which are allowed in
the audiences claim.

#### Defined in

[configuration/model/config.model.ts:73](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L73)

___

### validate\_token\_endpoint

• `Optional` **validate\_token\_endpoint**: `string`

Validate received token endpoint

#### Defined in

[configuration/model/config.model.ts:52](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L52)
