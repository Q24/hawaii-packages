// import { OidcService } from "../../dist/index";
import { OidcService } from "../../dist/index.modern.js";

OidcService.OidcConfigService.config = {
  client_id: "oidc_implicit_core_client",
  redirect_uri: window.location.href,
  response_type: "id_token",
  scope: "openid",
  debug: true,
  issuer: "https://www.certification.openid.net/test/a/ilionx",
};

console.log(OidcService);
document.getElementById("checkSession").onclick = () =>
  OidcService.checkSession();
window.OidcService = OidcService;
