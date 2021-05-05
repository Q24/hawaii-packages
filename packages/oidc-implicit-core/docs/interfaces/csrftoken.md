[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / CsrfToken

# Interface: CsrfToken

Session bound token. This token remain the same during your HTTP session (exception: changes once after successful login).

## Table of contents

### Properties

- [csrf\_token](csrftoken.md#csrf_token)
- [header\_name](csrftoken.md#header_name)
- [parameter\_key](csrftoken.md#parameter_key)

## Properties

### csrf\_token

• **csrf\_token**: *string*

The CSRF Token itself

Defined in: [models/token.models.ts:16](https://github.com/Q24/hawaii-packages/blob/b83b9d6/packages/oidc-implicit-core/src/models/token.models.ts#L16)

___

### header\_name

• **header\_name**: *string*

CSRF Token Header name

Defined in: [models/token.models.ts:8](https://github.com/Q24/hawaii-packages/blob/b83b9d6/packages/oidc-implicit-core/src/models/token.models.ts#L8)

___

### parameter\_key

• **parameter\_key**: *string*

CRSF Token key to be used

Defined in: [models/token.models.ts:12](https://github.com/Q24/hawaii-packages/blob/b83b9d6/packages/oidc-implicit-core/src/models/token.models.ts#L12)
