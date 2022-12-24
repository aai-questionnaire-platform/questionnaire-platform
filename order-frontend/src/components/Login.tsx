import { getWithAuth, postWithoutAuth } from '@/api/rest-connector';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { setCookie } from '../util/storage';
import { getAuthCookieParameters } from './AuthenticatedRoute/utils';
import Loader from './Loader';

const Error = styled.div`
  background-color: ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.white};
  border-radius: 50px;
  padding: 20px;
  margin: 20px;
  text-align: center;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto 0;
`;

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Login() {
  const navigate = useNavigate();
  const query = useQuery();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const runUseEffect = async () => {
      const code = query.get('code');
      const state = query.get('state');

      if (!code || !state) {
        return;
      }

      try {
        setLoading(true);

        const result = await postWithoutAuth(
          JSON.stringify({ code, state }),
          'token'
        );
        const authParams: any = getAuthCookieParameters(result.token);
        setCookie(
          { accessToken: authParams.accessToken },
          authParams.expiration
        );

        await getWithAuth('wallet');

        navigate('/');
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    runUseEffect();
  }, [navigate, query]);

  if (loading) {
    return (
      <LoaderContainer>
        <Loader />
      </LoaderContainer>
    );
  }

  if (error) {
    return <Error>{t('loginError')}</Error>;
  }

  return null;
}

export default Login;
