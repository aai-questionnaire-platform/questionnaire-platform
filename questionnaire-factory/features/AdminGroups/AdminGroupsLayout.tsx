import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import AdminHeader from '@/components/AdminHeader';
import Background from '@/components/Background';
import Container from '@/components/Container';
import { AdminGroupsComponent } from '@/schema/Components';
import { useAppTheme } from '@/util/hooks';

import AdminGroupsHeader from './AdminGroupsHeader';

interface AdminGroupsLayoutProps {
  config: Omit<AdminGroupsComponent['props'], 'children'>;
}

const AdminGroupsContainer = styled.div`
  color: ${({ theme }) => theme.adminGroups.text};
`;

function AdminGroupsLayout({
  children,
  config: { background, headerLogo },
}: PropsWithChildren<AdminGroupsLayoutProps>) {
  const theme = useAppTheme();

  return (
    <Background bg={background}>
      <AdminGroupsContainer>
        <AdminHeader
          backgroundColor={theme.adminGroups?.header?.bgColor}
          borderColor={theme.adminGroups?.header?.border}
          color={theme.adminAnswerSummary?.header.fgColor}
        >
          <AdminGroupsHeader logo={headerLogo} />
        </AdminHeader>

        <Container as="main" pv={24} ph={16}>
          {children}
        </Container>
      </AdminGroupsContainer>
    </Background>
  );
}

export default AdminGroupsLayout;
