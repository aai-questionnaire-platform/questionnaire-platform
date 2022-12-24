import i18n from 'i18next';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import * as R from 'ramda';
import { initReactI18next, useSSR as useI18nSSR } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import { SWRConfig } from 'swr';

import { createSwrConfig } from '@/api/util';
import ConditionalWrapper from '@/components/ConditionalWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeBase } from '@/components/ThemeBase';
import { AuthDef } from '@/schema/AppStructure';
import { AppStaticProps } from '@/types';
import { mergeTitles } from '@/util';
import { metaTitleLens } from '@/util/lenses';

import { AppConfigContext } from './AppConfigContext';
import Auth from './Auth';

i18n.use(initReactI18next).init({
  fallbackLng: 'fi',
  parseMissingKeyHandler: (key: string) =>
    typeof window === 'undefined' ? key : '',
});

interface AppPageProps extends AppStaticProps {
  session: Session;
}
function WithAppContext(WrappedComponent: Function) {
  return function WrappedWithAppContext(props: AppPageProps) {
    const {
      appProps = {} as AppStaticProps['appProps'],
      routeProps = {} as AppStaticProps['routeProps'],
    } = props as AppStaticProps;

    const pageSubTitle = R.view(metaTitleLens, routeProps);

    const { data: session } = useSession({ required: false });
    useI18nSSR(appProps.translations, appProps.meta.lang);

    return (
      <ErrorBoundary>
        <ConditionalWrapper
          if={!!routeProps.meta.auth}
          with={(children) => (
            <Auth auth={routeProps.meta.auth as AuthDef}>{children}</Auth>
          )}
        >
          <AppConfigContext.Provider value={appProps.meta}>
            <ThemeProvider theme={routeProps.theme ?? {}}>
              <Head>
                <title>
                  {mergeTitles(R.view(metaTitleLens, appProps), pageSubTitle)}
                </title>
              </Head>

              <ThemeBase>
                <SWRConfig value={createSwrConfig(session)}>
                  <WrappedComponent {...props} />
                </SWRConfig>
              </ThemeBase>
            </ThemeProvider>
          </AppConfigContext.Provider>
        </ConditionalWrapper>
      </ErrorBoundary>
    );
  };
}

export default WithAppContext;
