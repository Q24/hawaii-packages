[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / LogUtil

# Class: LogUtil

## Table of contents

### Constructors

- [constructor](logutil.md#constructor)

### Methods

- [debug](logutil.md#debug)
- [emitLog](logutil.md#emitlog)
- [error](logutil.md#error)
- [info](logutil.md#info)
- [warn](logutil.md#warn)

## Constructors

### constructor

• **new LogUtil**()

## Methods

### debug

▸ `Static` **debug**(`msg`, ...`supportingDetails`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `...supportingDetails` | `any`[] |

#### Returns

`void`

#### Defined in

[utils/logUtil.ts:4](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/utils/logUtil.ts#L4)

___

### emitLog

▸ `Static` `Private` **emitLog**(`logType`, `msg`, ...`supportingDetails`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `logType` | ``"log"`` \| ``"info"`` \| ``"warn"`` \| ``"error"`` |
| `msg` | `string` |
| `...supportingDetails` | `any`[] |

#### Returns

`void`

#### Defined in

[utils/logUtil.ts:20](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/utils/logUtil.ts#L20)

___

### error

▸ `Static` **error**(`msg`, ...`supportingDetails`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `...supportingDetails` | `any`[] |

#### Returns

`void`

#### Defined in

[utils/logUtil.ts:16](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/utils/logUtil.ts#L16)

___

### info

▸ `Static` **info**(`msg`, ...`supportingDetails`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `...supportingDetails` | `any`[] |

#### Returns

`void`

#### Defined in

[utils/logUtil.ts:8](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/utils/logUtil.ts#L8)

___

### warn

▸ `Static` **warn**(`msg`, ...`supportingDetails`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `...supportingDetails` | `any`[] |

#### Returns

`void`

#### Defined in

[utils/logUtil.ts:12](https://github.com/Q24/hawaii-packages/blob/59af354/packages/oidc-implicit-core/src/utils/logUtil.ts#L12)
