import { DynamoDBAdapter } from '@next-auth/dynamodb-adapter';
import NextAuth, { SessionUser } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

import {
  AAIProvider,
  adminProfileHandler,
  createDynamoDBClient,
} from '@/util/nextauth-utils';

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  jwt: { secret: process.env.JWT_SECRET },
  debug: process.env.NODE_ENV === 'development',
  adapter: DynamoDBAdapter(createDynamoDBClient(), {
    tableName: process.env.NEXT_TOKEN_DB_NAME!,
  }),
  pages: {
    error: '/auth/error',
    signIn: '/auth/error',
    signOut: '/auth/error',
  },
  providers: [
    AAIProvider('mt-test', {
      clientId: process.env.MUNTESTI_CLIENTID!,
      clientSecret: process.env.MUNTESTI_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('mt-dev', {
      clientId: process.env.MUNTESTI_CLIENTID!,
      clientSecret: process.env.MUNTESTI_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('mt-local', {
      clientId: process.env.MUNTESTI_CLIENTID!,
      clientSecret: process.env.MUNTESTI_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('hv-local', {
      clientId: process.env.HOIVAAVATNUORET_CLIENTID!,
      clientSecret: process.env.HOIVAAVATNUORET_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('hv-dev', {
      clientId: process.env.HOIVAAVATNUORET_CLIENTID!,
      clientSecret: process.env.HOIVAAVATNUORET_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('hv-test', {
      clientId: process.env.HOIVAAVATNUORET_CLIENTID!,
      clientSecret: process.env.HOIVAAVATNUORET_CLIENTSECRET!,
      authorization: {
        params: { scope: 'openid tampere_demo_flag store:tampere_demo_flag' },
      },
    }),

    AAIProvider('sp-local', {
      clientId: process.env.SURUPOLKU_CLIENTID!,
      clientSecret: process.env.SURUPOLKU_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    AAIProvider('sp-dev', {
      clientId: process.env.SURUPOLKU_CLIENTID!,
      clientSecret: process.env.SURUPOLKU_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    AAIProvider('sp-test', {
      clientId: process.env.SURUPOLKU_CLIENTID!,
      clientSecret: process.env.SURUPOLKU_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    AAIProvider('mr-local', {
      clientId: process.env.MUNRIPARI_CLIENTID!,
      clientSecret: process.env.MUNRIPARI_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    AAIProvider('mr-dev', {
      clientId: process.env.MUNRIPARI_CLIENTID!,
      clientSecret: process.env.MUNRIPARI_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    AAIProvider('mr-test', {
      clientId: process.env.MUNRIPARI_CLIENTID!,
      clientSecret: process.env.MUNRIPARI_CLIENTSECRET!,
      authorization: { params: { scope: 'openid' } },
    }),

    CognitoProvider({
      id: 'admin-mt-test',
      name: 'Muntesti-testi Group Admin',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-mt-dev',
      name: 'Muntesti-dev Group Admin',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-mt-local',
      name: 'Muntesti-local Group Admin',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-mr-local',
      name: 'Mun ripari Group Admin (local)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-mr-dev',
      name: 'Mun ripari Group Admin (dev)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-mr-test',
      name: 'Mun ripari Group Admin (test)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-hv-test',
      name: 'Hoivaavat nuoret Group Admin',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-sp-local',
      name: 'Surupolku Group Admin Login (local)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-sp-dev',
      name: 'Surupolku Group Admin Login (dev)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),

    CognitoProvider({
      id: 'admin-sp-test',
      name: 'Surupolku Group Admin Login (test)',
      clientId: process.env.COGNITO_CLIENTID!,
      clientSecret: process.env.COGNITO_CLIENTSECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      profile: adminProfileHandler,
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      session.user = token.user as SessionUser;
      session.token = token.idToken as string;
      return session;
    },

    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.idToken = account.id_token;
      }
      if (user) {
        token.user = user;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // allow all redirects, also outside current origin
      return url;
    },
  },
});
