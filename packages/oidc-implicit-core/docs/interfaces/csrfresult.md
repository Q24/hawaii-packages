[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / CsrfResult

# Interface: CsrfResult

Session bound token. This token remain the same during your HTTP session (exception: changes once after successful login).

## Table of contents

### Properties

- [csrf\_token](csrfresult.md#csrf_token)
- [header\_name](csrfresult.md#header_name)
- [parameter\_key](csrfresult.md#parameter_key)

## Properties

### csrf\_token

• **csrf\_token**: `string`

The CSRF Token itself

#### Defined in

[csrf/csrf.model.ts:16](https://github.com/Q24/hawaii-packages/blob/dbaae5f/packages/oidc-implicit-core/src/csrf/csrf.model.ts#L16)

___

### header\_name

• **header\_name**: `string`

CSRF Token Header name

#### Defined in

[csrf/csrf.model.ts:8](https://github.com/Q24/hawaii-packages/blob/dbaae5f/packages/oidc-implicit-core/src/csrf/csrf.model.ts#L8)

___

### parameter\_key

• **parameter\_key**: `string`

CRSF Token key to be used

#### Defined in

[csrf/csrf.model.ts:12](https://github.com/Q24/hawaii-packages/blob/dbaae5f/packages/oidc-implicit-core/src/csrf/csrf.model.ts#L12)
