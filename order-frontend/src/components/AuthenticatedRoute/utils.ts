import jwt_decode from 'jwt-decode';

import { withUrlParams } from '../../api/utils';

export function getAuthCookieParameters(jwt: string) {
  const decoded: any = jwt_decode(jwt);
  return { accessToken: jwt, expiration: decoded.exp };
}

export function toAAILogin() {
  const loginUrl = process.env.REACT_APP_LOGIN_URL;
  const loginClientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
  const loginRedirect = process.env.REACT_APP_LOGIN_REDIRECT;

  if (!loginUrl || !loginClientId || !loginRedirect) {
    return;
  }

  const query = {
    response_type: 'code',
    client_id: loginClientId,
    redirect_uri: encodeURIComponent(loginRedirect),
    scope: 'scope',
    state: 'state',
  };

  window.location.href = withUrlParams(loginUrl, query);
}
