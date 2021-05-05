[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / Token

# Interface: Token

Interface: Token
Token received in URL from Authorisation

## Table of contents

### Properties

- [access\_token](token.md#access_token)
- [expires](token.md#expires)
- [expires\_in](token.md#expires_in)
- [id\_token](token.md#id_token)
- [session\_upgrade\_token](token.md#session_upgrade_token)
- [state](token.md#state)
- [token\_type](token.md#token_type)

## Properties

### access\_token

• `Optional` **access\_token**: *string*

Token for use with REST calls

Defined in: [models/token.models.ts:28](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L28)

___

### expires

• `Optional` **expires**: *number*

Expiry time of token

Defined in: [models/token.models.ts:48](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L48)

___

### expires\_in

• `Optional` **expires\_in**: *string*

Token expiry in seconds

Defined in: [models/token.models.ts:40](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L40)

___

### id\_token

• `Optional` **id\_token**: *string*

ID Token

Defined in: [models/token.models.ts:44](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L44)

___

### session\_upgrade\_token

• `Optional` **session\_upgrade\_token**: *string*

Session Upgrade token received from Authorisation

Defined in: [models/token.models.ts:52](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L52)

___

### state

• `Optional` **state**: *string*

State string

Defined in: [models/token.models.ts:36](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L36)

___

### token\_type

• `Optional` **token\_type**: *string*

Type of token received, usually `Bearer`

Defined in: [models/token.models.ts:32](https://github.com/Q24/hawaii-packages/blob/90fe1a3/packages/oidc-implicit-core/src/models/token.models.ts#L32)
