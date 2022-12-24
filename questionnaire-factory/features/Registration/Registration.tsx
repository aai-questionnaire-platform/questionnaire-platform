import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import Background from '@/components/Background';
import NetworkError from '@/components/NetworkError';
import { RegistrationComponent, RegistrationMethod } from '@/schema/Components';

import { useRegistrationData } from './util';

type RegistrationProps = RegistrationComponent['props'];

const REGISTRATION_COMPONENTS: Record<RegistrationMethod, any> = {
  PIN_CODE: dynamic(() => import('./PinCode')),
};

function Registration({ background, method, ...rest }: RegistrationProps) {
  const Component = REGISTRATION_COMPONENTS[method];
  const { data, error, loading } = useRegistrationData();
  const { data: session } = useSession();
  const router = useRouter();

  if (error) {
    return <NetworkError error={error} />;
  }

  if (!loading && data.settings?.organization_hierarchy) {
    router.replace(`/${router.query.appId}/${rest.nextButton.slug}`);
    return null;
  }

  return (
    <Background bg={background}>
      <Component
        {...rest}
        organizations={data.organizations}
        user={session!.user}
      />
    </Background>
  );
}

export default Registration;
