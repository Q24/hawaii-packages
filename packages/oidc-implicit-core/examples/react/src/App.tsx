import { useEffect, useState } from "react";
import { OidcProvider, useOidc } from "./oidc/OidcProvider";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { ProtectedRoute } from "./oidc/ProtectedRoute";
import { useUrlRestoration } from "./oidc/useUrlRestoration";
import { Logout } from "./Logout";
import { getProfile } from "./api/profile";
import { globals } from "./globals";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    getProfile().then(({ data }) => {
      setProfile(data);
    });
  }, []);

  return <pre>{JSON.stringify(profile, null, 2)}</pre>;
};

const Nested = () => {
  useUrlRestoration();
  const [state, setState] = useState(1);
  const { isAuthenticated } = useOidc();
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/users">Users</Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/logout">logout</Link>
            </li>
          )}
        </ul>
      </nav>

      <Switch>
        <ProtectedRoute path="/profile">
          <Profile></Profile>
        </ProtectedRoute>
        <ProtectedRoute path="/users">users</ProtectedRoute>
        <Route path="/logout">
          <Logout />
        </Route>
        <Route path="/">home</Route>
      </Switch>

      <div>state: {state}</div>
      <button
        onClick={() => {
          setState((s) => s + 1);
        }}
      >
        change state
      </button>
    </>
  );
};

function App() {
  const [oidcConfig] = useState({
    debug: true,
    provider_id: "example",
    client_id: `example`,
    response_type: "id_token token",
    authorisation: `${globals.ssoBaseUrl}/sso/`,
    post_logout_redirect_uri: `${globals.ssoBaseUrl}/logged-out`,
    scope: "openid",
    token_type: "Bearer",
    authorize_endpoint: `${globals.ssoBaseUrl}/sso/authorize`,
    csrf_token_endpoint: `${globals.ssoBaseUrl}/sso/csrf`,
    validate_token_endpoint: `${globals.restBaseUrl}/sso/check-tokens`,
    is_session_alive_endpoint: `${globals.restBaseUrl}/sso/is-session-alive`,
    upgrade_session_endpoint: `${globals.ssoBaseUrl}/sso/session-upgrade`,
    redirect_uri: `${window.location.origin}/app`,
    login_endpoint: `${globals.ssoBaseUrl}/sso/j_spring_security_check`,
    logout_endpoint: `${globals.ssoBaseUrl}/sso/logout`,
    restricted_redirect_uris: ["logout", "login"],
    silent_refresh_uri: `${window.location.protocol}//${window.location.hostname}/app/assets/silent-refresh-html/silent.html`,
  });

  return (
    <div>
      <OidcProvider oidcConfig={oidcConfig} autoLogout={15000}>
        <BrowserRouter basename="app">
          <Nested />
        </BrowserRouter>
      </OidcProvider>
    </div>
  );
}

export default App;
