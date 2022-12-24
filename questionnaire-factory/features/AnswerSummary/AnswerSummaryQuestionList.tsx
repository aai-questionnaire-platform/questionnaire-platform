import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AnswerSummaryChart from '@/components/AnswerSummaryChart';
import BadgeImage from '@/components/BadgeImage';
import Collapsible from '@/components/Collapsible';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Heading from '@/components/Heading';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { AnswerSummaryQuestion, Category } from '@/types';
import { useAppTheme } from '@/util/hooks';

import { formatOrdinal } from './util';

interface AnswerSummaryQuestionListProps {
  questions: AnswerSummaryQuestion[];
  category: Category;
  categoryIndex: number;
  image?: string;
}

const AnswerSummaryCollapsible = styled(Collapsible)`
  background: ${({ theme }) => theme.answerSummary.list?.bgColor ?? '#fff'};
  color: ${({ theme }) => theme.answerSummary.list?.fgColor ?? 'currentColor'};
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
`;

function AnswerSummaryQuestionList({
  questions,
  category,
  categoryIndex,
  image,
}: AnswerSummaryQuestionListProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <>
      <Container ph={16}>
        <Spacer mb={8}>
          <Heading variant="h2" as="h1">
            {category.description}
          </Heading>
        </Spacer>

        <Heading
          variant="h1"
          as="h2"
          id="answer-summary-heading"
          align="center"
        >
          {t('answerSummary.results')}
        </Heading>
      </Container>

      {image ? (
        <Spacer mv={24}>
          <BadgeImage src={image} alt="" />
        </Spacer>
      ) : (
        <Divider />
      )}

      <Container ph={16}>
        <Spacer m={0} mb={24}>
          <Typography id="answer-summary-description">
            {t('answerSummary.description')}
          </Typography>
        </Spacer>

        <ol
          aria-labelledby="answer-summary-heading"
          aria-describedby="answer-summary-description"
        >
          {questions.map((question, index) => (
            <li key={index}>
              <Spacer mb={16}>
                <AnswerSummaryCollapsible
                  heading={
                    <Typography
                      variant="default"
                      as="h3"
                      weight={500}
                      align="left"
                    >
                      {`${index + 1}. ${question.label}`}
                    </Typography>
                  }
                  data-cy="answersummary-question-list-item"
                >
                  <AnswerSummaryChart
                    question={question}
                    colors={theme.answerSummary!.chart}
                  />
                </AnswerSummaryCollapsible>
              </Spacer>
            </li>
          ))}
        </ol>

        <Spacer mt={56}>
          <Typography>
            {t('answerSummary.endText', {
              ordinal: formatOrdinal(categoryIndex + 1, t),
            })}
          </Typography>
        </Spacer>
      </Container>
    </>
  );
}

export default AnswerSummaryQuestionList;
