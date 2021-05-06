import { OidcService } from "@hawaii-framework/oidc-implicit-core";
import axios, { AxiosRequestConfig } from "axios";

const setAuthHeader = async (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> => {
  const storedToken = OidcService.getStoredToken();

  if (storedToken) {
    config.headers["Authorization"] = OidcService.getAuthHeader(storedToken);

    // For info see Token Expiration section in Readme
    if (
      (storedToken.expires || 0) - Math.round(new Date().getTime() / 1000.0) <
      300
    ) {
      OidcService.silentRefreshAccessToken();
    }
    return config;
  } else {
    // The check session method will either return
    // that the user is indeed logged in, or redirect
    // the user to the login page. This redirection
    // will be triggered automatically by the library.
    const isLoggedIn = await OidcService.checkSession();
    if (isLoggedIn) {
      config = await setAuthHeader(config);
      return config;
    } else {
      throw new axios.Cancel("User is not logged in");
    }
  }
};

// Add a request interceptor
axios.interceptors.request.use(setAuthHeader, (error) => {
  Promise.reject(error);
});
