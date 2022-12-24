import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';

import { AuthDef } from '@/schema/AppStructure';

type AuthProps = PropsWithChildren<{
  auth: AuthDef;
}>;

function Auth({ auth, children }: AuthProps) {
  const router = useRouter();
  const { appId } = router.query;
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated: () => router.replace(`/${appId}`),
  });

  if (status === 'loading') {
    return <div />;
  }

  if (!auth.roles.includes(session.user.scope)) {
    router.replace(`/${appId}`);
    return null;
  }

  return <>{children}</>;
}

export default Auth;
