import {
  checkSession,
  getAuthHeader,
  getStoredAuthResult,
  silentRefresh,
} from "@hawaii-framework/oidc-implicit-core";
import axios, { AxiosRequestConfig } from "axios";

const setAuthHeader = async (
  config: AxiosRequestConfig,
): Promise<AxiosRequestConfig> => {
  const storedAuthResult = getStoredAuthResult();

  if (storedAuthResult) {
    config.headers["Authorization"] = getAuthHeader(storedAuthResult);

    // For info see Token Expiration section in Readme
    if (
      (storedAuthResult.expires || 0) - Math.round(new Date().getTime() / 1000.0) <
      300
    ) {
      silentRefresh();
    }
    return config;
  } else {
    // The check session method will either return
    // that the user is indeed logged in, or redirect
    // the user to the login page. This redirection
    // will be triggered automatically by the library.
    const isLoggedIn = await checkSession();
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
