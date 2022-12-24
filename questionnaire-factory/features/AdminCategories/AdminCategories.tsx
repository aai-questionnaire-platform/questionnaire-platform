import Head from 'next/head';
import { useRouter } from 'next/router';
import * as R from 'ramda';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Heading from '@/components/Heading';
import NetworkError from '@/components/NetworkError';
import Typography from '@/components/Typography';
import { useAppConfig } from '@/components/WithAppContext';
import { AdminCategoriesComponent } from '@/schema/Components';
import { Group } from '@/types';
import {
  combineCategoryWithProgress,
  getQueryParam,
  mergeTitles,
} from '@/util';
import { useAppTheme } from '@/util/hooks';

import AdminCategoriesLayout from './AdminCategoriesLayout';
import AdminCategoriesSkeleton from './AdminCategoriesSkeleton';
import CategoryList from './CategoryList';
import { useAdminCategoriesData } from './util';

const GroupMemberCount = styled(Typography)`
  padding-bottom: 1rem;
`;

const PinCode = styled(Typography)`
  border-radius: 0.75rem;
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) =>
    theme.adminCategories?.categoryListItem?.bgColor};
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

function AdminCategories(props: AdminCategoriesComponent['props']) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useAppTheme();
  const organizationIds = getQueryParam('organizationIds', router).split(',');
  const { data, error, loading } = useAdminCategoriesData(organizationIds);
  const { title } = useAppConfig();

  const config = R.omit(['children'], props);

  if (loading) {
    return (
      <AdminCategoriesLayout config={config}>
        <Container ph={16}>
          <AdminCategoriesSkeleton rows={3} />
        </Container>
      </AdminCategoriesLayout>
    );
  }

  if (error) {
    return <NetworkError error={error} />;
  }

  const groupId = organizationIds[organizationIds.length - 1];
  const group = data.groups?.find((group: Group) => group.id === groupId);

  const questionnaire = data.questionnaire;
  const categories = questionnaire.categories ?? [];
  const categoriesWithProgress = categories.map(
    combineCategoryWithProgress(data.progress)
  );

  const memberCount = categoriesWithProgress[0]?.groupMemberCount ?? 0;

  return (
    <AdminCategoriesLayout config={config}>
      <Head>
        <title>
          {mergeTitles(
            title,
            t('adminCategories.title', { groupName: group.name })
          )}
        </title>
      </Head>

      <Heading variant="h1">{group.name}</Heading>

      <GroupMemberCount>
        {t('adminCategories.groupMemberCount', { memberCount })}
      </GroupMemberCount>

      <PinCode data-cy="group-pin">
        <Trans
          i18nKey="adminCategories.groupPinCode"
          values={{ pin: group.pin }}
          components={{ bold: <Typography as="span" weight="bold" /> }}
        />
      </PinCode>

      <Divider color={theme.adminCategories?.divider} />

      <CategoryList
        categories={categoriesWithProgress}
        config={config}
        organizationIds={organizationIds}
        questionnaireId={questionnaire.id}
      />
    </AdminCategoriesLayout>
  );
}

export default AdminCategories;
