/**
 * Interface: CsrfToken
 * Session bound token. This token remain the same during your HTTP session (exception: changes once after succesful login).
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
 * Interface: Token
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

export interface JWT {
  scope: string[];
  exp: number;
}

export interface TokenValidationOptions {
  scopes?: string[];
  customTokenValidator?: (token: Readonly<Token>) => boolean;
}
