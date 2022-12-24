import { Card } from '@/components/CategoryCommon/types';
import {
  createCards,
  getLastAnsweredQuestionId,
  replaceOrAddAnswer,
  resolveInitialCardIndex,
} from '@/components/CategoryCommon/util';
import { Answer, CategoryWithProgress, ReducerAction } from '@/types';
import { combineCategoryWithProgress } from '@/util';

export interface CategoryState {
  activeCardIndex: number;
  answers: Answer[];
  cards: Card[];
  category: CategoryWithProgress;
}

type ActionNextCard = ReducerAction<typeof TYPE_NEXT_CARD>;
type ActionPrevCard = ReducerAction<typeof TYPE_PREV_CARD>;
type ActionSetAnswers = ReducerAction<
  typeof TYPE_SET_ANSWERS,
  { answers: Answer[] }
>;
type ActionSelectAnswer = ReducerAction<
  typeof TYPE_SELECT_ANSWER,
  { answer: Answer }
>;
type CategoryAction =
  | ActionNextCard
  | ActionPrevCard
  | ActionSetAnswers
  | ActionSelectAnswer;

const TYPE_NEXT_CARD = 'TYPE_NEXT_CARD';
const TYPE_PREV_CARD = 'TYPE_PREV_CARD';
const TYPE_SET_ANSWERS = 'TYPE_SET_ANSWERS';
const TYPE_SELECT_ANSWER = 'TYPE_SELECT_ANSWER';

export const actions = {
  nextCard(): ActionNextCard {
    return { type: TYPE_NEXT_CARD };
  },
  prevCard(): ActionPrevCard {
    return { type: TYPE_PREV_CARD };
  },
  setAnswers(answers: Answer[]): ActionSetAnswers {
    return { type: TYPE_SET_ANSWERS, answers };
  },
  selectAnswer(answer: Answer): ActionSelectAnswer {
    return { type: TYPE_SELECT_ANSWER, answer };
  },
};

export function resolveInitialState({
  answers,
  category,
  progress,
}: any): CategoryState {
  const cards = createCards(category);
  const initialCardIndex = resolveInitialCardIndex(
    category,
    cards,
    -1,
    getLastAnsweredQuestionId(category, answers)
  );

  return {
    activeCardIndex: initialCardIndex,
    answers,
    cards,
    category: combineCategoryWithProgress(progress, category),
  };
}

export function reducer(
  state: CategoryState,
  action: CategoryAction
): CategoryState {
  switch (action.type) {
    case TYPE_NEXT_CARD: {
      return {
        ...state,
        activeCardIndex: Math.min(
          state.cards.length,
          state.activeCardIndex + 1
        ),
      };
    }
    case TYPE_PREV_CARD: {
      return {
        ...state,
        activeCardIndex: Math.max(0, state.activeCardIndex - 1),
      };
    }
    case TYPE_SET_ANSWERS:
      return { ...state, answers: action.answers };
    case TYPE_SELECT_ANSWER: {
      const answers = replaceOrAddAnswer(action.answer, state.answers);
      return {
        ...state,
        answers,
      };
    }
    default:
      return state;
  }
}
