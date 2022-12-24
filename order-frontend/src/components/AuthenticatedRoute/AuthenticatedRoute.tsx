import { getCookie } from '../../util/storage';
import { toAAILogin } from './utils';

const AuthenticatedRoute = ({ children }: { children: JSX.Element }) => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    toAAILogin();
    return null;
  }

  return children;
};

export default AuthenticatedRoute;
