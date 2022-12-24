import { withUrlParams } from '../../api/utils';

export function getAuthParamsFromHash(hash: string) {
  const hashParams = new URLSearchParams(hash.substring(1));
  const accessToken = hashParams.get('access_token') || '';
  const expiration = hashParams.get('expires_in') || '';
  return { accessToken, expiration };
}

export function toCognitoLogin() {
  if (window.Cypress) {
    return;
  }

  const loginUrl = process.env.REACT_APP_LOGIN_URL;
  const loginClientId = process.env.REACT_APP_LOGIN_CLIENT_ID;
  const loginRedirect = process.env.REACT_APP_LOGIN_REDIRECT;

  if (!loginUrl || !loginClientId || !loginRedirect) {
    return;
  }

  const query = {
    response_type: 'token',
    client_id: loginClientId,
    redirect_uri: encodeURIComponent(loginRedirect),
  };

  window.location.href = withUrlParams(loginUrl, query);
}
