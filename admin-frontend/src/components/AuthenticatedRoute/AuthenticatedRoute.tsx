import { Route, RouteProps } from 'react-router-dom';
import { getCookie } from '../../util/storage';
import { toCognitoLogin } from './utils';

const AuthenticatedRoute = ({ children, ...rest }: RouteProps) => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    toCognitoLogin();
    return null;
  }

  return <Route {...rest}>{children}</Route>;
};

export default AuthenticatedRoute;
