// import { checkSession, configure, getUserInfo } from "../../dist/index";
import {
  checkSession,
  configure,
  getUserInfo,
} from "../../dist/index.modern.js";

configure({
  client_id: "oidc_implicit_core_client",
  redirect_uri: window.location.href,
  response_type: "id_token",
  scope: "openid",
  debug: true,
  issuer: "https://www.certification.openid.net/test/a/ilionx",
});

document.getElementById("checkSession").onclick = () => {
  checkSession();
};
document.getElementById("scope").onchange = (e) => {
  configure((currentConfig) => ({
    ...currentConfig,
    scope: e.target.value,
  }));
};
document.getElementById("response_type").onchange = (e) => {
  configure((currentConfig) => ({
    ...currentConfig,
    response_type: e.target.value,
  }));
};
document.getElementById("getUserInfo").onclick = () => {
  getUserInfo().then((userInfo) => {
    console.log(userInfo);
  });
};
