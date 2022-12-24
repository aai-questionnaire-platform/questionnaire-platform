import * as R from 'ramda';

import { CardType, CategoryState } from '@/enums';
import { Answer, Category, CategoryWithProgress } from '@/types';
import { replaceOrAdd } from '@/util';

import { Card, ChantCard, QuestionCard } from './types';

export const getCategoryMessage = (msgName: string, category: Category) =>
  R.join('', R.pathOr([], ['data', msgName], category));

export function createCards(category: Category): Card[] {
  const hasExitMessage = !!getCategoryMessage('exitMessages', category)?.length;

  let cards: Card[] = category.questions.map((q, i) => ({
    index: 0,
    type: CardType.QUESTION,
    question: q,
    description: category.description,
    questionIndex: i,
  }));

  if (hasExitMessage) {
    cards.push({
      index: 0,
      type: CardType.CHANT,
      message: getCategoryMessage('exitMessages', category),
      description: category.description,
      questionIndex: cards.length - 1,
    } as ChantCard);
  }

  return cards.map((c, i) => ({ ...c, index: i }));
}

/**
 * Add an answer to a list if it doesn't already contain it. If it does then replace it with the current value.
 * Also removes all empty answers from the list.
 * @param answer
 * @param list
 */
export const replaceOrAddAnswer = (answer: Answer, list: Answer[] = []) =>
  replaceOrAdd(R.eqProps('question_id', answer), answer, list).filter(
    R.propSatisfies((v: string) => v.length > 0, 'answer_value')
  );

/**
 * Check if card requires an answer or if it's question is answered
 * @param activeCard
 * @param answers
 * @returns
 */
export const isAnswerNotRequiredOrSelectedForCard = (
  activeCard: Card,
  answers: Answer[]
) => {
  if (activeCard?.type !== CardType.QUESTION) {
    return true;
  }

  const card = activeCard as QuestionCard;

  if (!card.question) {
    return true;
  }

  return R.pipe<any, any, any, boolean>(
    R.find(R.propEq('question_id', card.question.id)),
    R.prop('answer_value'),
    Boolean
  )(answers);
};

const hasAnswer = R.curry((answers, questionId) =>
  answers.some(R.propEq('question_id', questionId))
);

/**
 * Get the id of a question that is the last one answered in a category
 * @param category
 * @param answers
 * @returns
 */
export const getLastAnsweredQuestionId = (
  category: Category,
  answers: Answer[]
) =>
  category
    ? R.findLast(hasAnswer(answers), category.questions.map(R.prop('id')))
    : undefined;

/**
 * Resolve the index of the card that will initially be shown when navigated to category. If a question is answered
 * the initial card will be the next question card. If no question or all the questions are answered then the initial
 * card will be the first card.
 * @param category
 * @param cards
 * @param lastAnsweredQuestionId
 * @returns
 */
export const resolveInitialCardIndex = (
  category: Category,
  cards: Card[],
  startFrom = -1,
  lastAnsweredQuestionId?: string
) =>
  lastAnsweredQuestionId &&
  lastAnsweredQuestionId !== R.last(category.questions)?.id
    ? cards.findIndex(R.pathEq(['question', 'id'], lastAnsweredQuestionId)) + 1
    : startFrom;

export const resolveInitialCardOnce = R.once(resolveInitialCardIndex);

export const isCategoryLocked = R.pipe<[CategoryWithProgress], any, boolean>(
  R.prop('state'),
  R.includes(R.__, [CategoryState.COMPLETED, CategoryState.APPROVED])
);
