/**
 * Authorize redirect URL Parameters
 */
export interface AuthorizeParams {
  /**
   * State string
   */
  state: string;
  /**
   * Nonce string
   */
  nonce: string;
  /**
   * Authorisation endpoint
   */
  authorization: string;
  /**
   * The ID of the Authorisation
   */
  providerId: string;
  /**
   * The ID of your client
   */
  client_id: string;
  /**
   * What type of token(s) you wish to receive
   * In case op Open Id Connect this is usually `token id_token`
   */
  response_type: string;
  /**
   * The URL you want to be redirected to after redirect from Authorisation
   */
  redirect_uri: string;
  /**
   * Define the scopes you want to add to your session.
   * Multiple scopes will be added in a single strings, separated by spaces.
   */
  scope: string;

  /**
   * We add prompt=none to the URL when silently refreshing an access token.
   * This way the refresh token call will not 'hang' on the (hidden) login screen, when authorize failed.
   */
  prompt?: string;
  /**
   * string value that specifies how the Authorization Server displays the authentication and consent user interface pages to the End-User.
   */
}

/**
 * Flush state param
 */
export interface URLParams {
  /**
   * Flush state param
   */
  flush_state?: boolean;
}

/**
 * A set of strings to match when the Authorize redirect is erroring. This is the complete list of possible error to handle.
 */
export type AuthorizeErrors =
  | "invalid_client"
  | "unauthorized_client"
  | "invalid_grant"
  | "unsupported_grant_type"
  | "invalid_scope"
  | "invalid_request_response_type"
  | "invalid_request_type"
  | "invalid_request_openid_type"
  | "invalid_request_redirect_uri"
  | "invalid_request_signature"
  | "invalid_request_realm"
  | "invalid_request_atype"
  | "invalid_request_recipient";
