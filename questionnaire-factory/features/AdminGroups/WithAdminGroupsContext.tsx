import { useSession } from 'next-auth/react';
import * as R from 'ramda';

import Container from '@/components/Container';
import NetworkError from '@/components/NetworkError';

import { AdminGroupsContext } from './AdminGroupsContext';
import AdminGroupsLayout from './AdminGroupsLayout';
import GroupAdminSkeleton from './AdminGroupsSkeleton';
import { useAdminGroupsData } from './util';

function WithAdminGroupsContext(WrappedComponent: any) {
  return function WrappedWithAppContext(props: any) {
    const { data: session } = useSession();
    const { data, error, loading } = useAdminGroupsData(
      R.last(session!.user.organizationIds)!
    );

    const config = R.omit(['children'], props);

    if (loading) {
      return (
        <AdminGroupsLayout config={config}>
          <Container ph={16}>
            <GroupAdminSkeleton rows={3} />
          </Container>
        </AdminGroupsLayout>
      );
    }

    if (error) {
      return <NetworkError error={error} />;
    }

    return (
      <AdminGroupsLayout config={config}>
        <AdminGroupsContext.Provider
          value={{ ...data, config: R.omit(['children'], props) }}
        >
          <WrappedComponent {...props} />
        </AdminGroupsContext.Provider>
      </AdminGroupsLayout>
    );
  };
}

export default WithAdminGroupsContext;
