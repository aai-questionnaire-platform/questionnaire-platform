import * as R from 'ramda';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Container from '@/components/Container';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Icon from '@/components/Icon';
import Typography from '@/components/Typography';

import Card from '../Card';
import CategoryProgressTracker from '../CategoryProgressTracker';
import { QuestionCardProps } from '../types';
import Option, { OptionLabel } from './Option';
import { DenseOptionsList, OptionsList } from './OptionsList';

const HeadingContainer = styled.div<{ categoryLocked?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ categoryLocked }) =>
    categoryLocked ? '20px 32px' : '20px 16px'};
`;

const LockedIcon = styled(Icon)`
  position: absolute;
  left: 16px;
`;

const QuestionTitle = styled(Heading)`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

function QuestionCard({
  card,
  question,
  answers,
  questionCount,
  isCategoryLocked,
  selectAnswer,
}: PropsWithChildren<QuestionCardProps>) {
  const { t } = useTranslation();
  const { id, topic, label, description, maxSelectedOptions } = question;
  const idFrom = (s: string) => `${s}-${id}`;
  const questionLabelId = idFrom('question-label');
  const descriptionLabel = idFrom('question-description');
  const selectedAnswer = answers.find(
    R.propEq('question_id', id)
  )?.answer_value;
  const isMultiSelect = Boolean(maxSelectedOptions && maxSelectedOptions > 1);
  const OptionsListComponent =
    isMultiSelect || question.options.length > 5
      ? DenseOptionsList
      : OptionsList;

  return (
    <Card>
      <HeadingContainer categoryLocked={isCategoryLocked}>
        {isCategoryLocked && (
          <LockedIcon
            icon="lock"
            alt={t('questionLockedDescription')}
            data-cy="category-locked"
          />
        )}
        <Heading variant="h2" as="h1" align="center">
          {card.description}
        </Heading>
      </HeadingContainer>

      <CategoryProgressTracker
        type="bar"
        activeStep={card.questionIndex}
        totalSteps={questionCount}
      />

      <Flex
        direction="column"
        justify="space-evenly"
        grow={1}
        style={{ overflow: 'auto' }}
      >
        <Container p={16} pt={0} style={{ height: '100%', overflowY: 'auto' }}>
          {topic && (
            <Container pb={16}>
              <Typography variant="small" as="h2" align="center">
                {topic.label}
              </Typography>
            </Container>
          )}

          <QuestionTitle
            variant="h2"
            as={topic ? 'h3' : 'h2'}
            id={questionLabelId}
            align="center"
            data-cy="question-title"
          >
            {label}
          </QuestionTitle>

          {isMultiSelect && description && (
            <Container pt={8} id={descriptionLabel}>
              <Typography as="div" align="center">
                {description}
              </Typography>
            </Container>
          )}

          <OptionsListComponent
            aria-labelledby={questionLabelId}
            aria-required="true"
            aria-describedby={description ? descriptionLabel : undefined}
            maxSelectedOptions={maxSelectedOptions}
            value={selectedAnswer}
            onChange={(value: string) =>
              selectAnswer({
                question_id: id,
                answer_value: value,
              })
            }
          >
            {question.options.map(({ label: optionLabel, value }) => (
              <Option
                key={value}
                label={<OptionLabel as="span">{optionLabel}</OptionLabel>}
                value={value}
                disabled={isCategoryLocked}
              />
            ))}
          </OptionsListComponent>
        </Container>
      </Flex>
    </Card>
  );
}

export default QuestionCard;
