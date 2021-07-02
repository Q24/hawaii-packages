import type { JWTHeader } from "./jwt-header.model";

/**
 * Session bound token. This token remain the same during your HTTP session (exception: changes once after successful login).
 */
export interface CsrfToken {
  /**
   * CSRF Token Header name
   */
  header_name: string;
  /**
   * CRSF Token key to be used
   */
  parameter_key: string;
  /**
   * The CSRF Token itself
   */
  csrf_token: string;
}

/**
 * https://openid.net/specs/openid-connect-implicit-1_0.html#ImplicitOK
 *
 * If the End-User grants the access request, the Authorization Server issues an
 * Access Token and delivers it to the Client by adding the following parameters
 * to the fragment component of the Redirection URI using the
 * application/x-www-form-urlencoded format as defined in Section 4.2.2 of OAuth
 * 2.0 [RFC6749] and OAuth 2.0 Multiple Response Type Encoding Practices
 * [OAuth.Responses].
 *
 * In the Implicit Flow, the entire response is returned in the fragment
 * component of the Redirection URI, as defined in 4.2.2 of OAuth 2.0 [RFC6749].
 */
export interface AuthResult {
  /**
   * Access Token for the UserInfo Endpoint.
   */
  access_token?: string;
  /**
   * REQUIRED. OAuth 2.0 Token Type value. The value MUST be Bearer, as
   * specified in OAuth 2.0 Bearer Token Usage [RFC6750], for Clients using this
   * subset. Note that the token_type value is case insensitive.
   */
  token_type?: "Bearer";
  /**
   * OAuth 2.0 state value. REQUIRED if the state parameter is present in the
   * Authorization Request. Clients MUST verify that the state value is equal to
   * the value of state parameter in the Authorization Request.
   */
  state?: string;
  /**
   * ID Token
   */
  id_token?: string;
  /**
   * Expiration time of the Access Token in seconds since the response was
   * generated.
   */
  expires_in?: string;
  /**
   * Expiry time of token
   */
  expires?: number;
  /**
   * Session Upgrade token received from Authorisation
   */
  session_upgrade_token?: string;
}

export interface JWT<T = AccessTokenPayload> {
  header: JWTHeader;
  payload: T;
  verifySignature: string;
}

/**
 * A JSON Web Token, unpacked. Is used for describing the contents
 * of an access token.
 */
export interface AccessTokenPayload {
  /**
   * The scopes the token has.
   */
  scope: string[];

  /**
   * The expiration date of the token.
   */
  exp?: number;

  /**
   * Subject
   */
  sub?: string;

  /**
   * Authorized party
   */
  azp?: string;

  /**
   * Issuer
   */
  iss?: string;

  /**
   * Issued At time
   */
  iat?: number;

  /**
   * JWT ID (unique for token)
   */
  jti?: string;
}

/**
 * An object that is used to determine whether a token
 * meets requirements set forth herein, such as a scope.
 */
export interface TokenValidationOptions {
  /**
   * A list of scopes that the token must have.
   */
  scopes?: string[];
  /**
   * A custom validation function that is called when trying
   * to retrieve a (possibly pre-existing) Token.
   */
  customTokenValidator?: (token: Readonly<AuthResult>) => boolean;
}
