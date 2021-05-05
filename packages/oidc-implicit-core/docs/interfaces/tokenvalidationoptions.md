[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / TokenValidationOptions

# Interface: TokenValidationOptions

## Table of contents

### Properties

- [customTokenValidator](tokenvalidationoptions.md#customtokenvalidator)
- [scopes](tokenvalidationoptions.md#scopes)

## Properties

### customTokenValidator

• `Optional` **customTokenValidator**: (`token`: *Readonly*<[*Token*](token.md)\>) => *boolean*

#### Type declaration:

▸ (`token`: *Readonly*<[*Token*](token.md)\>): *boolean*

#### Parameters:

| Name | Type |
| :------ | :------ |
| `token` | *Readonly*<[*Token*](token.md)\> |

**Returns:** *boolean*

Defined in: [models/token.models.ts:62](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/models/token.models.ts#L62)

Defined in: [models/token.models.ts:62](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/models/token.models.ts#L62)

___

### scopes

• `Optional` **scopes**: *string*[]

Defined in: [models/token.models.ts:61](https://github.com/Q24/hawaii-packages/blob/6770c06/packages/oidc-implicit-core/src/models/token.models.ts#L61)
