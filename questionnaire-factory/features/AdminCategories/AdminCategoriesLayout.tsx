import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AdminHeader from '@/components/AdminHeader';
import Background from '@/components/Background';
import Container from '@/components/Container';
import HeaderBackButton from '@/components/HeaderBackButton';
import { AdminCategoriesComponent } from '@/schema/Components';
import { useAppTheme } from '@/util/hooks';

interface AdminCategoriesLayoutProps {
  config: Omit<AdminCategoriesComponent['props'], 'children'>;
}

const AdminCategoriesContainer = styled.div`
  color: ${({ theme }) => theme.adminCategories.text};
`;

function AdminCategoriesLayout({
  children,
  config: { background, headerBackLink },
}: PropsWithChildren<AdminCategoriesLayoutProps>) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <Background bg={background}>
      <AdminCategoriesContainer>
        <AdminHeader
          backgroundColor={theme.adminCategories?.header.bgColor}
          borderColor={theme.adminCategories?.header.border}
          color={theme.adminAnswerSummary?.header.fgColor}
        >
          <HeaderBackButton
            slug={headerBackLink.slug}
            label={t('adminCategories.headerBackLinkLabel')}
          />
        </AdminHeader>

        <Container as="main" pv={24} ph={16}>
          {children}
        </Container>
      </AdminCategoriesContainer>
    </Background>
  );
}

export default AdminCategoriesLayout;
