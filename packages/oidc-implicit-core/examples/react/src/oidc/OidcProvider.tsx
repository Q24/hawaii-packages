import {
  OidcConfig,
  OidcService,
} from "@hawaii-framework/oidc-implicit-core";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface OidcContextValue {
  isInitialized: boolean;
  isAuthenticated: boolean;
  refreshAuthStatus: () => Promise<void>;
  oidcConfig: OidcConfig;
}

// @ts-ignore
const OidcContext = createContext<OidcContextValue>(null);

interface OidcProviderProps {
  oidcConfig: OidcConfig;
  autoLogout?: number | false;
}

export const OidcProvider = ({
  children,
  oidcConfig,
  autoLogout,
}: PropsWithChildren<OidcProviderProps>) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshAuthStatus = useCallback(
    () => OidcService.checkSession().then(() => setIsAuthenticated(true)),
    [],
  );

  /**
   * Initialize OIsDC Config
   */
  useEffect(() => {
    setIsInitialized(false);
    OidcService.OidcConfigService.config = oidcConfig;
    setIsInitialized(true);
  }, [oidcConfig]);

  useAutomaticLogout({
    isAuthenticated,
    oidcConfig,
    autoLogout,
  });

  const oidcInfo = useMemo<OidcContextValue>(
    () => ({
      isInitialized,
      refreshAuthStatus,
      isAuthenticated,
      oidcConfig,
    }),
    [isAuthenticated, isInitialized, oidcConfig, refreshAuthStatus],
  );
  return (
    <OidcContext.Provider value={oidcInfo}>{children}</OidcContext.Provider>
  );
};

export const useOidc = () => useContext(OidcContext);

export const useRequireAuthenticated = (
  deps?: React.DependencyList | undefined,
) => {
  const { refreshAuthStatus, isAuthenticated, isInitialized } = useOidc();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isInitialized) {
      setLoading(true);
      refreshAuthStatus().then(() => {
        setLoading(false);
      });
    }

    return () => {};
    // @ts-ignore
  }, [isInitialized, refreshAuthStatus, ...deps]);

  return {
    loading,
    isAuthenticated,
  };
};

interface UseAutomaticLogout {
  autoLogout?: number | false;
  isAuthenticated: boolean;
  oidcConfig: OidcConfig;
}
const useAutomaticLogout = ({
  autoLogout,
  isAuthenticated,
  oidcConfig,
}: UseAutomaticLogout) => {
  useEffect(() => {
    if (autoLogout && isAuthenticated) {
      const autoLogoutInterval = setInterval(() => {
        // Get stored token either returns a non-expired token or null
        const storedToken = OidcService.getStoredToken();

        if (!storedToken) {
          OidcService.isSessionAlive().catch(() => {
            clearInterval(autoLogoutInterval);

            // Navigate to the logged out page via the router.
            window.location.href =
              oidcConfig.post_logout_redirect_uri;
          });
        }
      }, autoLogout);

      return () => {
        if (autoLogoutInterval) {
          clearInterval(autoLogoutInterval);
        }
      };
    }
  }, [autoLogout, isAuthenticated, oidcConfig.post_logout_redirect_uri]);
};
