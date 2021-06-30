[@hawaii-framework/oidc-implicit-core](../README.md) / [Exports](../modules.md) / OidcConfig

# Interface: OidcConfig

Config Object for OIDC Service

## Table of contents

### Properties

- [authorisation](oidcconfig.md#authorisation)
- [authorize\_endpoint](oidcconfig.md#authorize_endpoint)
- [client\_id](oidcconfig.md#client_id)
- [code\_login](oidcconfig.md#code_login)
- [csrf\_token\_endpoint](oidcconfig.md#csrf_token_endpoint)
- [debug](oidcconfig.md#debug)
- [is\_session\_alive\_endpoint](oidcconfig.md#is_session_alive_endpoint)
- [login\_endpoint](oidcconfig.md#login_endpoint)
- [logout\_endpoint](oidcconfig.md#logout_endpoint)
- [post\_logout\_redirect\_uri](oidcconfig.md#post_logout_redirect_uri)
- [provider\_id](oidcconfig.md#provider_id)
- [qr](oidcconfig.md#qr)
- [redirect\_uri](oidcconfig.md#redirect_uri)
- [response\_type](oidcconfig.md#response_type)
- [restricted\_redirect\_uris](oidcconfig.md#restricted_redirect_uris)
- [scope](oidcconfig.md#scope)
- [silent\_logout\_uri](oidcconfig.md#silent_logout_uri)
- [silent\_refresh\_uri](oidcconfig.md#silent_refresh_uri)
- [token\_type](oidcconfig.md#token_type)
- [twofactor\_endpoint](oidcconfig.md#twofactor_endpoint)
- [twofactor\_msisdn\_endpoint](oidcconfig.md#twofactor_msisdn_endpoint)
- [twofactor\_msisdn\_reset](oidcconfig.md#twofactor_msisdn_reset)
- [upgrade\_session\_endpoint](oidcconfig.md#upgrade_session_endpoint)
- [validate\_token\_endpoint](oidcconfig.md#validate_token_endpoint)

## Properties

### authorisation

• **authorisation**: *string*

The base URL of the Authorisation

Defined in: [models/config.models.ts:39](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L39)

___

### authorize\_endpoint

• **authorize\_endpoint**: *string*

Authorisation endpoint

Defined in: [models/config.models.ts:57](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L57)

___

### client\_id

• **client\_id**: *string*

Set the ID of your client

Defined in: [models/config.models.ts:12](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L12)

___

### code\_login

• `Optional` **code\_login**: *object*

Config object for code based login.

Also known as magic code or email code

#### Type declaration:

| Name | Type | Description |
| :------ | :------ | :------ |
| `confirm` | *string* | endpoint used for logging in to the service using the code provided in the user's mailbox. |
| `request` | *string* | endpoint for requesting the code to be send to the user's associated email address. |

Defined in: [models/config.models.ts:122](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L122)

___

### csrf\_token\_endpoint

• **csrf\_token\_endpoint**: *string*

CSRF token endpoint

Defined in: [models/config.models.ts:61](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L61)

___

### debug

• `Optional` **debug**: *boolean*

Verbose logging of inner workings of the package.

Defined in: [models/config.models.ts:135](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L135)

___

### is\_session\_alive\_endpoint

• **is\_session\_alive\_endpoint**: *string*

Endpoint for checking if a session is still used somewhere

Defined in: [models/config.models.ts:69](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L69)

___

### login\_endpoint

• **login\_endpoint**: *string*

`POST` to this endpoint in the login form

Defined in: [models/config.models.ts:77](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L77)

___

### logout\_endpoint

• **logout\_endpoint**: *string*

`POST` to this endpoint in the logout form

Defined in: [models/config.models.ts:93](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L93)

___

### post\_logout\_redirect\_uri

• **post\_logout\_redirect\_uri**: *string*

The URL you want to be redirected to after logging out

Defined in: [models/config.models.ts:43](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L43)

___

### provider\_id

• **provider\_id**: *string*

Set the ID of the Authorisation

Defined in: [models/config.models.ts:8](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L8)

___

### qr

• `Optional` **qr**: *object*

Config object for QR login with websocket

#### Type declaration:

| Name | Type | Description |
| :------ | :------ | :------ |
| `channel_qr` | *string* | Websocket channel for QR code rendering. When subscribing to this channel you will receive a code to parse to QR and render on screen. So this sets up your session to login with QR. |
| `channel_redirect` | *string* | Websocket channel for the Redirect. When subscribing to this channel you will receive a 302 redirect once the QR was scanned in the Vodafone App. So this will keep listening if your session started with the QR channel was succesfully scanned somewhere. |
| `web_socket` | *string* | Websocket BASE URL. Connect to this URL to have access to the subscription channels |

Defined in: [models/config.models.ts:97](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L97)

___

### redirect\_uri

• **redirect\_uri**: *string*

The URL you want to be redirected to after redirect from Authorisation

Defined in: [models/config.models.ts:21](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L21)

___

### response\_type

• **response\_type**: ``"id_token"`` \| ``"id_token token"``

What type of token(s) you wish to receive
In case op Open Id Connect this is usually `token id_token`

Defined in: [models/config.models.ts:17](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L17)

___

### restricted\_redirect\_uris

• **restricted\_redirect\_uris**: *string*[]

Array of URL's that are not allowed as `redirect_uri`

Defined in: [models/config.models.ts:35](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L35)

___

### scope

• **scope**: *string*

Define the scopes you want acces to. Each scope is seperated by space.
When using Open Id Connect, scope `openid` is mandatory

Defined in: [models/config.models.ts:48](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L48)

___

### silent\_logout\_uri

• `Optional` **silent\_logout\_uri**: *string*

The URL you want to use for a silent Logout, if your stack supports it.

Defined in: [models/config.models.ts:30](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L30)

___

### silent\_refresh\_uri

• `Optional` **silent\_refresh\_uri**: *string*

The URL you want to be redirected to after redirect from Authorisation, while doing a silent access token refresh

Defined in: [models/config.models.ts:25](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L25)

___

### token\_type

• **token\_type**: *string*

Define the type of token your want to receive from Authorisation.
In case of implicit flow this is usually 'Bearer'

Defined in: [models/config.models.ts:53](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L53)

___

### twofactor\_endpoint

• `Optional` **twofactor\_endpoint**: *string*

`POST` to this endpoint in the two-factor form

Defined in: [models/config.models.ts:81](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L81)

___

### twofactor\_msisdn\_endpoint

• `Optional` **twofactor\_msisdn\_endpoint**: *string*

`POST` to this endpoint in the two-factor provide MSISDN form

Defined in: [models/config.models.ts:85](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L85)

___

### twofactor\_msisdn\_reset

• `Optional` **twofactor\_msisdn\_reset**: *string*

`POST` to this endpoint in to remove an unconfirmed MSISDN

Defined in: [models/config.models.ts:89](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L89)

___

### upgrade\_session\_endpoint

• **upgrade\_session\_endpoint**: *string*

Session Upgrade endpoint

Defined in: [models/config.models.ts:73](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L73)

___

### validate\_token\_endpoint

• **validate\_token\_endpoint**: *string*

Validate received token endpoint

Defined in: [models/config.models.ts:65](https://github.com/Q24/hawaii-packages/blob/00a5256/packages/oidc-implicit-core/src/models/config.models.ts#L65)
