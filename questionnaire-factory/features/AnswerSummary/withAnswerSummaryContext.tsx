import { useRouter } from 'next/router';
import * as R from 'ramda';

import NetworkError from '@/components/NetworkError';
import { Category } from '@/types';
import { asColorDef, formAnswerSummaryData, getQueryParam } from '@/util';
import { categoryLens } from '@/util/lenses';

import { AnswerSummaryContext } from './AnswerSummaryContext';
import AnswerSummaryLayout from './AnswerSummaryLayout';
import AnswerSummarySkeleton from './AnswerSummarySkeleton';
import { useAnswerSummaryData } from './util';

function withAnswerSummaryContext(WrappedComponent: any) {
  return function WrappedWithAnswerSummaryContext(props: any) {
    const router = useRouter();
    const categoryId = getQueryParam('id', router);
    const { data, error, loading } = useAnswerSummaryData(categoryId);
    const config = R.omit(['children'], props);
    const category: Category | undefined = data.questionnaire
      ? R.view(categoryLens(categoryId), data.questionnaire)
      : undefined;
    const backgroundColor = category?.backgroundColor
      ? asColorDef(category.backgroundColor)
      : config.background;

    if (loading) {
      return (
        <AnswerSummaryLayout background={backgroundColor}>
          <AnswerSummarySkeleton rows={3} />
        </AnswerSummaryLayout>
      );
    }

    if (error) {
      return <NetworkError error={error} />;
    }

    if (!category) {
      router.replace('/404');
      return null;
    }

    return (
      <AnswerSummaryLayout background={backgroundColor}>
        <AnswerSummaryContext.Provider
          value={{
            ...data,
            category,
            config,
            answerSummary: formAnswerSummaryData(
              data.answerSummary,
              category,
              data.answers
            ),
            categoryIndex: data.questionnaire.categories.findIndex(
              R.equals(category)
            ),
          }}
        >
          <WrappedComponent {...props} />
        </AnswerSummaryContext.Provider>
      </AnswerSummaryLayout>
    );
  };
}

export default withAnswerSummaryContext;
