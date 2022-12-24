import Head from 'next/head';
import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';

import Heading from '@/components/Heading';
import NetworkError from '@/components/NetworkError';
import Typography from '@/components/Typography';
import { useAppConfig } from '@/components/WithAppContext';
import AdminAnswerSummaryLayout from '@/features/AdminAnswerSummary/AdminAnswerSummaryLayout';
import AdminAnswerSummaryList from '@/features/AdminAnswerSummary/AdminAnswerSummaryList';
import AdminAnswerSummarySkeleton from '@/features/AdminAnswerSummary/AdminAnswerSummarySkeleton';
import TopicAddressedBanner from '@/features/AdminAnswerSummary/TopicAddressedBanner';
import { useAdminAnswerSummaryData } from '@/features/AdminAnswerSummary/util';
import { AdminAnswerSummaryComponent } from '@/schema/Components';
import { CategoryWithProgress } from '@/types';
import {
  combineCategoryWithProgress,
  getQueryParam,
  mergeTitles,
} from '@/util';

function AdminAnswerSummary(props: AdminAnswerSummaryComponent['props']) {
  const router = useRouter();
  const { t } = useTranslation();
  const categoryId = getQueryParam('categoryId', router);
  const organizationIds = getQueryParam('organizationIds', router).split(',');
  const { data, error, loading } = useAdminAnswerSummaryData(
    categoryId,
    organizationIds
  );
  const { title } = useAppConfig();

  const config = R.omit(['children'], props);

  if (loading) {
    return (
      <AdminAnswerSummaryLayout config={config}>
        <AdminAnswerSummarySkeleton rows={3} />
      </AdminAnswerSummaryLayout>
    );
  }

  if (error) {
    return <NetworkError error={error} />;
  }

  const { answerSummary, progress, questionnaire } = data;

  const categories = questionnaire.categories ?? [];
  const categoriesWithProgress = categories.map(
    combineCategoryWithProgress(progress)
  );
  const category = categoriesWithProgress.find(R.propEq('id', categoryId));

  return (
    <AdminAnswerSummaryLayout config={config}>
      <Head>
        <title>
          {mergeTitles(
            title,
            t('adminAnswerSummary.title', {
              categoryName: category.description,
            })
          )}
        </title>
      </Head>

      <Heading variant="h1">{category.description}</Heading>

      <Typography>
        {t('adminAnswerSummary.completionStatistics', {
          completionCount: category.completionCount!,
          groupMemberCount: category.groupMemberCount!,
        })}
      </Typography>

      <TopicAddressedBanner
        category={category}
        organizationIds={organizationIds}
        questionnaireId={questionnaire.id}
        buttonVariant={config.buttonVariant}
      />

      <AdminAnswerSummaryList
        answerSummary={answerSummary}
        category={category}
      />
    </AdminAnswerSummaryLayout>
  );
}

export default AdminAnswerSummary;
