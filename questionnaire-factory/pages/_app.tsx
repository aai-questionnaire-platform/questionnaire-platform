import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import 'normalize.css';
import * as R from 'ramda';

import '@/styles/globals.css';
import { AppStaticProps } from '@/types';

// log app version once on startup
const logAppVersion = R.once((version: string) => {
  console.log(
    `%cApplication version ${version}`,
    'background-color: #006efd; color: #fff; font-weight: bold;' +
      'display: inline-block; padding: 4px 8px; text-align: center; border-radius: 4px;'
  );
});

type QuestionnaireFactoryAppProps = AppProps<
  AppStaticProps & { session: Session }
>;

function QuestionnaireFactory({
  Component,
  pageProps: { session, ...pageProps },
}: QuestionnaireFactoryAppProps) {
  pageProps.appProps?.version && logAppVersion(pageProps.appProps.version);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default QuestionnaireFactory;
