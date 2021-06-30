/**
 * # 2.3.  UserInfo Endpoint
 *
 * The UserInfo Endpoint is an OAuth 2.0 Protected Resource that returns Claims
 * about the authenticated End-User. The location of the UserInfo Endpoint MUST
 * be a URL using the https scheme, which MAY contain port, path, and query
 * parameter components. The returned Claims are represented by a JSON object
 * that contains a collection of name and value pairs for the Claims.
 *
 * Communication with the UserInfo Endpoint MUST utilize TLS.
 *
 * ## 2.3.1.  UserInfo Request
 *
 * Clients send requests to the UserInfo Endpoint to obtain Claims about the
 * End-User using an Access Token obtained through OpenID Connect
 * Authentication. The UserInfo Endpoint is an OAuth 2.0 [RFC6749] Protected
 * Resource that complies with the OAuth 2.0 Bearer Token Usage [RFC6750]
 * specification. The request SHOULD use the HTTP GET method and the Access
 * Token SHOULD be sent using the Authorization header field.
 *
 * ## 2.3.2.  Successful UserInfo Response
 *
 * The UserInfo Claims MUST be returned as the members of a JSON object. The
 * response body SHOULD be encoded using UTF-8 [RFC3629]. The Claims defined in
 * Section 2.5 can be returned, as can additional Claims not specified there.
 *
 * If a Claim is not returned, that Claim Name SHOULD be omitted from the JSON
 * object representing the Claims; it SHOULD NOT be present with a null or empty
 * string value. The sub (subject) Claim MUST always be returned in the UserInfo
 * Response.
 *
 * NOTE: Due to the possibility of token substitution attacks, the UserInfo
 * Response is not guaranteed to be about the End-User identified by the sub
 * (subject) element of the ID Token. The sub Claim in the UserInfo Response
 * MUST be verified to exactly match the sub Claim in the ID Token; if they do
 * not match, the UserInfo Response values MUST NOT be used.
 *
 * The Client MUST verify that the OP that responded was the intended OP through
 * a TLS server certificate check, per RFC 6125 [RFC6125].
 *
 * ## 2.3.3.  UserInfo Error Response
 * When an error condition occurs, the UserInfo Endpoint returns an Error
 * Response as defined in Section 3 of OAuth 2.0 Bearer Token Usage [RFC6750].
 */
export function getUserInfo() {
}
