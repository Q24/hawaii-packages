[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / TokenValidationOptions

# Interface: TokenValidationOptions

An object that is used to determine whether a token
meets requirements set forth herein, such as a scope.

## Table of contents

### Properties

- [customTokenValidator](tokenvalidationoptions.md#customtokenvalidator)
- [scopes](tokenvalidationoptions.md#scopes)

## Properties

### customTokenValidator

• `Optional` **customTokenValidator**: (`token`: *Readonly*<[*Token*](token.md)\>) => *boolean*

A custom validation function that is called when trying
to retrieve a (possibly pre-existing) Token.

#### Type declaration:

▸ (`token`: *Readonly*<[*Token*](token.md)\>): *boolean*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `token` | *Readonly*<[*Token*](token.md)\> |

**Returns:** *boolean*

Defined in: [models/token.models.ts:81](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/models/token.models.ts#L81)

Defined in: [models/token.models.ts:81](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/models/token.models.ts#L81)

___

### scopes

• `Optional` **scopes**: *string*[]

A list of scopes that the token must have.

Defined in: [models/token.models.ts:76](https://github.com/Q24/hawaii-packages/blob/95c67f6/packages/oidc-implicit-core/src/models/token.models.ts#L76)
