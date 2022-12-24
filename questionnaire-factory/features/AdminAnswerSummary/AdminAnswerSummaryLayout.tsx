import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { withUrlParams } from '@/api/util';
import AdminHeader from '@/components/AdminHeader';
import Background from '@/components/Background';
import Container from '@/components/Container';
import HeaderBackButton from '@/components/HeaderBackButton';
import { AdminAnswerSummaryComponent } from '@/schema/Components';
import { getQueryParam } from '@/util';
import { useAppTheme } from '@/util/hooks';

interface AdminAnswerSummaryLayoutProps {
  config: Omit<AdminAnswerSummaryComponent['props'], 'children'>;
}

const AdminAnswerSummaryContainter = styled.div`
  ${({ theme }) =>
    theme.adminAnswerSummary.fgColor &&
    `color: ${theme.adminAnswerSummary.fgColor}; `}
`;

function AdminAnswerSummaryLayout({
  children,
  config: { background, headerBackLink },
}: PropsWithChildren<AdminAnswerSummaryLayoutProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const organizationIds = getQueryParam('organizationIds', router);

  return (
    <Background bg={background}>
      <AdminAnswerSummaryContainter>
        <AdminHeader
          backgroundColor={theme.adminAnswerSummary?.header.bgColor}
          borderColor={theme.adminAnswerSummary?.header.border}
          color={theme.adminAnswerSummary?.header.fgColor}
        >
          <HeaderBackButton
            slug={withUrlParams(headerBackLink.slug, { organizationIds })}
            label={t('adminAnswerSummary.headerBackLinkLabel')}
            data-cy="admin-answer-summary-back-button"
          />
        </AdminHeader>
        <Container as="main" ph={16} pv={24}>
          {children}
        </Container>
      </AdminAnswerSummaryContainter>
    </Background>
  );
}

export default AdminAnswerSummaryLayout;
