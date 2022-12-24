import { withUrlParams } from '../../api/utils';
import { getEnvVariable } from '../../util';
import { setCookie } from '../../util/storage';

export function toCognitoLogout() {
  if (window.Cypress) {
    return;
  }

  const logoutUrl = getEnvVariable('REACT_APP_LOGOUT_URL');
  const loginClientId = getEnvVariable('REACT_APP_LOGIN_CLIENT_ID');
  const logoutRedirect = getEnvVariable('REACT_APP_LOGOUT_REDIRECT');

  const query = {
    client_id: loginClientId,
    logout_uri: logoutRedirect,
  };

  window.location.href = withUrlParams(logoutUrl, query);
}

export function logout() {
  setCookie({ accessToken: '' }, -1);
  toCognitoLogout();
}
