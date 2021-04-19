import configService, {
  StorageUtil,
  TokenService,
} from '@hawaii-framework/oidc-implicit-core/dist';
import { useEffect, useRef, useState } from 'react';

export const Logout = () => {
  const logoutAction = OidcConfigService.config.logout_endpoint;
  const [csrf, setCsrf] = useState('');
  const postLogoutUri = OidcConfigService.config.post_logout_redirect_uri;
  const [idTokenHint, setIdTokenHint] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const getCsrf = async () => {
      let _csrf = StorageUtil.read('_csrf');
      if (!_csrf) {
        _csrf = (await getCsrfToken()).csrf_token;
      }
      setCsrf(_csrf);
    };
    getCsrf();
  }, []);

  useEffect(() => {
    const getIdTokenHint = async () => {
      let idTokenHint = getIdTokenHint({ regex: true })!;

      setIdTokenHint(idTokenHint);
    };
    getIdTokenHint();
  }, []);

  useEffect(() => {
    if (csrf && idTokenHint) {
      sessionStorage.clear();
      formRef.current?.submit();
    }
  }, [csrf, idTokenHint]);

  // The ID_TOKEN_HINT can be requested from
  return (
    <form method='POST' action={logoutAction} ref={formRef} hidden>
      <input name='_csrf' value={csrf} />

      <input name='post_logout_redirect_uri' value={postLogoutUri} />

      <input name='id_token_hint' value={idTokenHint} />
    </form>
  );
};
