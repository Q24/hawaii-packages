import { AuthResultFilter } from "../../auth-result-filter/model/auth-result-filter.model";
import { JsonWebKeySet } from "../../discovery/model/jwks.model";
import { OpenIDProviderMetadata } from "../../discovery/model/openid-provider-metadata.model";

/**
 * Config Object for OIDC Service
 */
export interface OidcConfig {
  jwks?: JsonWebKeySet;
  providerMetadata?: OpenIDProviderMetadata;
  /**
   * Set the ID of your client
   */
  client_id: string;
  /**
   * What type of token(s) you wish to receive
   * In case op Open Id Connect this is usually `token id_token`
   */
  response_type: "id_token" | "id_token token";
  /**
   * The URL you want to be redirected to after redirect from Authorisation
   */
  redirect_uri: string;
  /**
   * The URL you want to be redirected to after redirect from Authorisation, while doing a silent access token refresh
   */
  silent_refresh_uri?: string;

  /**
   * The URL you want to use for a silent Logout, if your stack supports it.
   */
  silent_logout_uri?: string;

  /**
   * The URL you want to be redirected to after logging out
   */
  post_logout_redirect_uri: string;

  /**
   * Define the scopes you want access to. Each scope is separated by space.
   * When using Open Id Connect, scope `openid` is mandatory
   */
  scope: string;

  /**
   * CSRF token endpoint
   */
  csrf_token_endpoint?: string;

  /**
   * Validate received token endpoint
   */
  validate_token_endpoint?: string;

  /**
   * Endpoint for checking if a session is still used somewhere
   */
  is_session_alive_endpoint: string;

  /**
   * `POST` to this endpoint in the logout form
   */
  logout_endpoint: string;

  /**
   * Verbose logging of inner workings of the package.
   */
  debug?: boolean;

  /**
   * Audiences (client_id's) other than the current client which are allowed in
   * the audiences claim.
   */
  trusted_audiences?: string[];

  /**
   * The maximum time to pass between the issuance and consumption of an
   * authentication result.
   */
  issuedAtMaxOffset?: number;

  /**
   * The base issuer URL.
   */
  issuer: string;

  /**
   * A list of filters each auth result must adhere to.
   */
  defaultAuthResultFilters?: AuthResultFilter[];
}
