import NextAuth from 'next-auth';
import { CognitoProfile } from 'next-auth/providers/cognito';

declare module 'next-auth' {
  interface SessionUserBase {
    id: string;
    scope: string;
    name: string;
    userId: string;
  }

  interface SessionPlayerUser extends SessionUserBase {
    aud: string;
    organizationIds: never;
    groupIds: never;
  }

  interface SessionAdminUser extends SessionUserBase {
    aud: never;
    organizationIds: string[];
    groupIds: string[];
  }

  type SessionUser = SessionPlayerUser | SessionAdminUser;

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: SessionUser;
    expires: ISODateString;
    token: string;
  }
}

export interface AuroraAIProfile {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
}

export interface AdminCognitoProfile extends CognitoProfile {
  organization_ids?: string;
  group_ids?: string;
}

export interface AAIProviderProps {
  clientId: string;
  clientSecret: string;
  [key: string]: any;
}
