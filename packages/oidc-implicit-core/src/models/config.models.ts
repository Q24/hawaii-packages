/**
 * Config Object for OIDC Service
 */
export interface OidcConfig {
  /**
   * Set the ID of the Authorisation
   */
  provider_id: string;
  /**
   * Set the ID of your client
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
   * The URL you want to be redirected to after redirect from Authorisation, while doing a silent access token refresh
   */
  silent_refresh_uri?: string;

  /**
   * The URL you want to use for a silent Logout, if your stack supports it.
   */
  silent_logout_uri?: string;

  /**
   * Array of URL's that are not allowed as `redirect_uri`
   */
  restricted_redirect_uris: string[];
  /**
   * The base URL of the Authorisation
   */
  authorisation: string;
  /**
   * The URL you want to be redirected to after logging out
   */
  post_logout_redirect_uri: string;
  /**
   * Define the scopes you want acces to. Each scope is seperated by space.
   * When using Open Id Connect, scope `openid` is mandatory
   */
  scope: string;
  /**
   * Define the type of token your want to receive from Authorisation.
   * In case of implicit flow this is usually 'Bearer'
   */
  token_type: string;
  /**
   * Authorisation endpoint
   */
  authorize_endpoint: string;
  /**
   * CSRF token endpoint
   */
  csrf_token_endpoint: string;
  /**
   * Validate received token endpoint
   */
  validate_token_endpoint: string;
  /**
   * Endpoint for checking if a session is still used somewhere
   */
  is_session_alive_endpoint: string;
  /**
   * Session Upgrade endpoint
   */
  upgrade_session_endpoint: string;
  /**
   * `POST` to this endpoint in the login form
   */
  login_endpoint: string;
  /**
   * `POST` to this endpoint in the two-factor form
   */
  twofactor_endpoint?: string;
  /**
   * `POST` to this endpoint in the two-factor provide MSISDN form
   */
  twofactor_msisdn_endpoint?: string;
  /**
   * `POST` to this endpoint in to remove an unconfirmed MSISDN
   */
  twofactor_msisdn_reset?: string;
  /**
   * `POST` to this endpoint in the logout form
   */
  logout_endpoint: string;
  /**
   * Config object for QR login with websocket
   */
  qr?: QrCodeLoginConfig;
  /**
   * Config object for code based login
   * Also known as magic code or email code
   */
  code_login?: CodeBasedLoginConfig;
  /**
   * Debug On/Off (Logs to console)
   */
  debug?: boolean;
}

/**
 * Config object for QR Login via websocket
 */
export interface QrCodeLoginConfig {
  /**
   * Websocket BASE URL. Connect to this URL to have access to the subscription channels
   */
  web_socket: string;

  /**
   * Websocket channel for QR code rendering.
   * When subscribing to this channel you will receive a code to parse to QR and render on screen.
   * So this sets up your session to login with QR.
   */
  channel_qr: string;

  /**
   * Websocket channel for the Redirect.
   * When subscribing to this channel you will receive a 302 redirect once the QR was scanned in the Vodafone App.
   * So this will keep listening if your session started with the QR channel was succesfully scanned somewhere.
   */
  channel_redirect: string;
}

/**
 * Config object for code based login
 * Also known as magic code or email code
 */
export interface CodeBasedLoginConfig {
  /**
   * endpoint for requesting the code to be send to the user's associated email address.
   */
  request: string;
  /**
   * endpoint used for logging in to the service using the code provided in the user's email.
   */
  confirm: string;
}
