import i18n from 'i18next';
import Head from 'next/head';
import {
  initReactI18next,
  useSSR as useI18nSSR,
  WithTranslation,
  withTranslation,
} from 'react-i18next';
import styled from 'styled-components';

import * as translations from '@/assets/error.translations.json';

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 32px;
  text-align: center;
`;

const ErrorBody = styled.p`
  white-space: pre-line;
`;

const Button = styled.a`
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'IBM Plex Sans', sans-serif;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background-color: #006efd;
  color: #fff;
  text-decoration: none;
`;

i18n.use(initReactI18next).init({
  resources: translations,
});

function SigninErrorPage({ t }: WithTranslation) {
  useI18nSSR(translations, 'fi');

  return (
    <Main>
      <Head>
        <title>{t('signInError.title')}</title>
      </Head>

      <h1>{t('signInError.heading')}</h1>
      <ErrorBody>{t('signInError.body')}</ErrorBody>

      <Button href="/">{t('signInError.buttonLabel')}</Button>
    </Main>
  );
}

export default withTranslation()(SigninErrorPage);
