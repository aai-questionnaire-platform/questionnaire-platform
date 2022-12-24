import * as R from 'ramda';

import { AnswerSummaryOption } from '@/types';

export type AnswerSummaryChartData = AnswerSummaryChartItem[];

type AnswerSummaryChartItem = {
  isOwnAnswer: boolean;
  label: string;
  value: number;
};

export const calculateChartData = (
  answers: AnswerSummaryOption[],
  ownAnswer?: string
) => {
  const totalAnswerCount = getTotalAnswerCount(answers);

  return answers.map((answer) => ({
    label: answer.label,
    value: answer.answerCount / totalAnswerCount || 0,
    isOwnAnswer: ownAnswer
      ? ownAnswer.split(',').includes(answer.value)
      : false,
  })) as AnswerSummaryChartData;
};

export function getLabelContent(answerOption: AnswerSummaryChartItem) {
  const { label, value } = answerOption;
  return `${label} (${Math.round(value * 100)} %)`;
}

function getTotalAnswerCount(answers: AnswerSummaryOption[]) {
  let count = 0;
  for (const a of answers) {
    count += a.answerCount;
  }
  return count;
}

export function formatOwnAnswer(
  answers: AnswerSummaryOption[],
  ownAnswer: string
) {
  const answerLabels = ownAnswer
    .split(',')
    .map((i) => answers.find(R.propEq('value', i))?.label);

  return answerLabels.length ? answerLabels.join(', ') : '-';
}
