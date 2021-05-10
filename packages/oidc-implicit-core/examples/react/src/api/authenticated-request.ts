import { OidcService } from "@hawaii-framework/oidc-implicit-core";
import axios, { AxiosRequestConfig } from "axios";
import { globals } from "../globals";

export const authenticatedRequest = axios.create({
  baseURL: globals.restBaseUrl,
});

const setAuthHeader = async (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> => {
  const storedToken = OidcService.getStoredToken();

  if (storedToken) {
    config.headers["Authorization"] = OidcService.getAuthHeader(storedToken);

    if (
      (storedToken.expires || 0) - Math.round(new Date().getTime() / 1000.0) <
      300
    ) {
      OidcService.silentRefreshAccessToken();
    }
    return config;
  } else {
    const isLoggedIn = await OidcService.checkSession();
    if (isLoggedIn) {
      config = await setAuthHeader(config);
      return config;
    } else {
      throw new axios.Cancel("User is not logged in");
    }
  }
};

authenticatedRequest.interceptors.request.use(setAuthHeader);
