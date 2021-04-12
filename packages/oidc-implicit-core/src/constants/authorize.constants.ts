import { AuthorizeErrors } from "../models/url-param.models";

export const AUTHORIZE_ERRORS: AuthorizeErrors[] = [
  "invalid_client",
  "unauthorized_client",
  "invalid_grant",
  "unsupported_grant_type",
  "invalid_scope",
  "invalid_request_response_type",
  "invalid_request_type",
  "invalid_request_openid_type",
  "invalid_request_redirect_uri",
  "invalid_request_signature",
  "invalid_request_realm",
  "invalid_request_atype",
  "invalid_request_recipient",
];
