import { useRequireAuthenticated } from './OidcProvider';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { clearUrlToRestore, saveUrlToRestore } from './useUrlRestoration';

export function ProtectedRoute({
  children,
  ...rest
}: React.PropsWithChildren<RouteProps>) {
  const location = useLocation();
  let { isAuthenticated, loading } = useRequireAuthenticated([location.pathname]);
  useEffect(() => {
    if (loading) {
      console.log('saving url to restore...');
      saveUrlToRestore(location.pathname);
    } else if(isAuthenticated) {
      console.log('clearing url to restore...')
      clearUrlToRestore();
    }
  }, [location.pathname, loading, isAuthenticated]);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        loading ? null : isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
