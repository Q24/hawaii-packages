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
document.getElementById("checkSession").onclick = () => {
  OidcService.checkSession();
};
document.getElementById("scope").onchange = (e) => {
  OidcService.OidcConfigService.config.scope = e.target.value;
};
document.getElementById("response_type").onchange = (e) => {
  OidcService.OidcConfigService.config.response_type = e.target.value;
};
window.OidcService = OidcService;
document.getElementById("getUserInfo").onclick = () => {
  OidcService.getUserInfo().then((userInfo) => {
    console.log(userInfo);
  });
};
