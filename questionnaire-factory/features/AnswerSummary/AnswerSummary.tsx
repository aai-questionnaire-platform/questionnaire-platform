import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Flex from '@/components/Flex';
import LinkButton from '@/components/LinkButton';
import Spacer from '@/components/Spacer';
import { useAppConfig } from '@/components/WithAppContext';
import withSettingsGuard from '@/components/withSettingsGuard';
import { mergeTitles } from '@/util';

import { useAnswerSummaryContext } from './AnswerSummaryContext';
import AnswerSummaryNoResults from './AnswerSummaryNoResults';
import AnswerSummaryQuestionList from './AnswerSummaryQuestionList';
import withAnswerSummaryContext from './withAnswerSummaryContext';

function AnswerSummaryView() {
  const { t } = useTranslation();
  const { title } = useAppConfig();
  const {
    answerSummary,
    category,
    categoryIndex,
    config: { backLink, image },
  } = useAnswerSummaryContext();

  return (
    <>
      <Head>
        <title>
          {mergeTitles(
            title,
            t('answerSummary.answerSummaryTitle', {
              category: category.description,
            })
          )}
        </title>
      </Head>

      {answerSummary.questions.length ? (
        <AnswerSummaryQuestionList
          questions={answerSummary.questions}
          category={category}
          categoryIndex={categoryIndex}
          image={category.image ?? image}
        />
      ) : (
        <AnswerSummaryNoResults image={category.image ?? image} />
      )}

      <Spacer mt={34}>
        <Flex justify="center" align="center">
          <LinkButton
            slug={backLink.slug}
            label={t('answerSummary.backButton')}
          />
        </Flex>
      </Spacer>
    </>
  );
}

export default withSettingsGuard(withAnswerSummaryContext(AnswerSummaryView));
