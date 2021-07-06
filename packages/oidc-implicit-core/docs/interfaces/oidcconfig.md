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
- [jwks](oidcconfig.md#jwks)
- [logout\_endpoint](oidcconfig.md#logout_endpoint)
- [post\_logout\_redirect\_uri](oidcconfig.md#post_logout_redirect_uri)
- [providerMetadata](oidcconfig.md#providermetadata)
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

[configuration/model/config.model.ts:14](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L14)

___

### csrf\_token\_endpoint

• `Optional` **csrf\_token\_endpoint**: `string`

CSRF token endpoint

#### Defined in

[configuration/model/config.model.ts:48](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L48)

___

### debug

• `Optional` **debug**: `boolean`

Verbose logging of inner workings of the package.

#### Defined in

[configuration/model/config.model.ts:68](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L68)

___

### defaultAuthResultFilters

• `Optional` **defaultAuthResultFilters**: `AuthResultFilter`[]

A list of filters each auth result must adhere to.

#### Defined in

[configuration/model/config.model.ts:90](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L90)

___

### is\_session\_alive\_endpoint

• **is\_session\_alive\_endpoint**: `string`

Endpoint for checking if a session is still used somewhere

#### Defined in

[configuration/model/config.model.ts:58](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L58)

___

### issuedAtMaxOffset

• `Optional` **issuedAtMaxOffset**: `number`

The maximum time to pass between the issuance and consumption of an
authentication result.

#### Defined in

[configuration/model/config.model.ts:80](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L80)

___

### issuer

• **issuer**: `string`

The base issuer URL.

#### Defined in

[configuration/model/config.model.ts:85](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L85)

___

### jwks

• `Optional` **jwks**: `JsonWebKeySet`

#### Defined in

[configuration/model/config.model.ts:9](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L9)

___

### logout\_endpoint

• **logout\_endpoint**: `string`

`POST` to this endpoint in the logout form

#### Defined in

[configuration/model/config.model.ts:63](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L63)

___

### post\_logout\_redirect\_uri

• **post\_logout\_redirect\_uri**: `string`

The URL you want to be redirected to after logging out

#### Defined in

[configuration/model/config.model.ts:37](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L37)

___

### providerMetadata

• `Optional` **providerMetadata**: `OpenIDProviderMetadata`

#### Defined in

[configuration/model/config.model.ts:10](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L10)

___

### redirect\_uri

• **redirect\_uri**: `string`

The URL you want to be redirected to after redirect from Authorisation

#### Defined in

[configuration/model/config.model.ts:23](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L23)

___

### response\_type

• **response\_type**: ``"id_token"`` \| ``"id_token token"``

What type of token(s) you wish to receive
In case op Open Id Connect this is usually `token id_token`

#### Defined in

[configuration/model/config.model.ts:19](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L19)

___

### scope

• **scope**: `string`

Define the scopes you want access to. Each scope is separated by space.
When using Open Id Connect, scope `openid` is mandatory

#### Defined in

[configuration/model/config.model.ts:43](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L43)

___

### silent\_logout\_uri

• `Optional` **silent\_logout\_uri**: `string`

The URL you want to use for a silent Logout, if your stack supports it.

#### Defined in

[configuration/model/config.model.ts:32](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L32)

___

### silent\_refresh\_uri

• `Optional` **silent\_refresh\_uri**: `string`

The URL you want to be redirected to after redirect from Authorisation, while doing a silent access token refresh

#### Defined in

[configuration/model/config.model.ts:27](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L27)

___

### trusted\_audiences

• `Optional` **trusted\_audiences**: `string`[]

Audiences (client_id's) other than the current client which are allowed in
the audiences claim.

#### Defined in

[configuration/model/config.model.ts:74](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L74)

___

### validate\_token\_endpoint

• `Optional` **validate\_token\_endpoint**: `string`

Validate received token endpoint

#### Defined in

[configuration/model/config.model.ts:53](https://github.com/Q24/hawaii-packages/blob/5893d6f/packages/oidc-implicit-core/src/configuration/model/config.model.ts#L53)
