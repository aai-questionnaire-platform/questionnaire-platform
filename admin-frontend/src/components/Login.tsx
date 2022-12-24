import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getCookie, setCookie } from '../util/storage';
import { getAuthParamsFromHash } from './AuthenticatedRoute/utils';

function Login() {
  const history = useHistory();

  useEffect(() => {
    const accessToken = getCookie('accessToken');

    if (!accessToken) {
      const params = getAuthParamsFromHash(window.location.hash);
      setCookie({ accessToken: params.accessToken }, +params.expiration);
      history.replace('/');
    }
  }, [history]);

  return null;
}

export default Login;
