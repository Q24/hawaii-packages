import type { ImplicitRequestParameters } from "./implicit-request-parameters.models";

/**
 * Authorize redirect URL Parameters
 */
export interface AuthorizeParams extends ImplicitRequestParameters {
  /**
   * Authorisation endpoint
   */
  authorization: string;

  /**
   * The URL you want to be redirected to after redirect from Authorisation
   */
  redirect_uri: string;
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
