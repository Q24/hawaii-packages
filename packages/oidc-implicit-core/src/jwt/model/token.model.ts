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
 * Token received in URL from Authorisation
 */
export interface Token {
  /**
   * Token for use with REST calls
   */
  access_token?: string;
  /**
   * Type of token received, usually `Bearer`
   */
  token_type?: string;
  /**
   * State string
   */
  state?: string;
  /**
   * Token expiry in seconds
   */
  expires_in?: string;
  /**
   * ID Token
   */
  id_token?: string;
  /**
   * Expiry time of token
   */
  expires?: number;
  /**
   * Session Upgrade token received from Authorisation
   */
  session_upgrade_token?: string;
}

export interface JWT<T = JWTPayload> {
  header: JWTHeader;
  payload: T;
  verifySignature: string;
}


/**
 * A JSON Web Token, unpacked. Is used for describing the contents
 * of an access token.
 */
export interface JWTPayload {
  /**
   * The scopes the token has.
   */
  scope: string[];
  /**
   * The expiration date of the token.
   */
  exp: number;
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
  customTokenValidator?: (token: Readonly<Token>) => boolean;
}
