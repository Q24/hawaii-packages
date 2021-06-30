[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / Token

# Interface: Token

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

Defined in: [models/token.models.ts:26](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L26)

___

### expires

• `Optional` **expires**: *number*

Expiry time of token

Defined in: [models/token.models.ts:46](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L46)

___

### expires\_in

• `Optional` **expires\_in**: *string*

Token expiry in seconds

Defined in: [models/token.models.ts:38](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L38)

___

### id\_token

• `Optional` **id\_token**: *string*

ID Token

Defined in: [models/token.models.ts:42](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L42)

___

### session\_upgrade\_token

• `Optional` **session\_upgrade\_token**: *string*

Session Upgrade token received from Authorisation

Defined in: [models/token.models.ts:50](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L50)

___

### state

• `Optional` **state**: *string*

State string

Defined in: [models/token.models.ts:34](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L34)

___

### token\_type

• `Optional` **token\_type**: *string*

Type of token received, usually `Bearer`

Defined in: [models/token.models.ts:30](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/token.models.ts#L30)
