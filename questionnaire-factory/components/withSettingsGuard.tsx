import { useRouter } from 'next/router';

import { useSettings } from '@/api/hooks';
import NetworkError from '@/components/NetworkError';

function withSettingsGuard(WrappedComponent: Function) {
  return function WrappedWithSettingsGuard(props: any) {
    const router = useRouter();
    const api = useSettings();

    if (!api.loading && !api.error && !api.data?.organization_hierarchy) {
      router.replace(`/${router.query.appId}/register`);
      return null;
    }

    if (api.error) {
      return <NetworkError error={api.error} />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withSettingsGuard;
