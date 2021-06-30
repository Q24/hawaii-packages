// import { OidcService } from "../../dist/index";
import { OidcService } from "../../dist/index.modern.js";

OidcService.OidcConfigService.config = {
  client_id: "oidc_implicit_core_client",
  redirect_uri: window.location.href,
  authorize_endpoint:
    "https://www.certification.openid.net/test/a/ilionx/authorize",
  response_type: "id_token",
  scope: "openid",
  authorisation: "https://www.certification.openid.net/test/a/ilionx/",
  validate_token_endpoint:
    "https://www.certification.openid.net/test/a/ilionx/token",
  debug: true,
};

console.log(OidcService);
document.getElementById("checkSession").onclick = () =>
  OidcService.checkSession();
window.OidcService = OidcService;
