import { Card, QuestionCard } from '@/components/CategoryCommon/types';
import {
  isAnswerNotRequiredOrSelectedForCard,
  getLastAnsweredQuestionId,
  resolveInitialCardIndex,
  isCategoryLocked,
} from '@/components/CategoryCommon/util';
import { CardType, CategoryState } from '@/enums';
import { Answer, Category } from '@/types';

describe('Category/utils', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('isAnswerNotRequiredOrSelectedForActiveCard', () => {
    it('should return true if card is not a question card', () => {
      const activeCard = { type: CardType.CHANT } as Card;
      expect(isAnswerNotRequiredOrSelectedForCard(activeCard, [])).toBe(true);
    });

    it('should return true if card has no question', () => {
      const activeCard = { type: CardType.QUESTION } as QuestionCard;
      expect(isAnswerNotRequiredOrSelectedForCard(activeCard, [])).toBe(true);
    });

    it('should return true if the question is answered', () => {
      const activeCard = {
        type: CardType.QUESTION,
        question: { id: '1' },
      } as QuestionCard;
      const answers = [{ question_id: '1', answer_value: '1' }] as Answer[];
      expect(isAnswerNotRequiredOrSelectedForCard(activeCard, answers)).toBe(
        true
      );
    });

    it("should return false if card's question is unanswered", () => {
      const activeCard = {
        type: CardType.QUESTION,
        question: { id: '1' },
      } as QuestionCard;

      expect(isAnswerNotRequiredOrSelectedForCard(activeCard, [])).toBe(false);
    });
  });

  describe('getLastAnsweredQuestion', () => {
    const answers = [
      { answer_value: '1', question_id: '1' },
      { answer_value: '1', question_id: '49' },
      { answer_value: '1', question_id: '2' },
    ] as Answer[];

    const categories = [
      { id: '1', questions: [{ id: '1' }, { id: '2' }, { id: '3' }] },
      { id: '2', questions: [{ id: '49' }] },
    ] as Category[];

    it('should return the last answered question from the category', () => {
      let actual = getLastAnsweredQuestionId(categories[0], answers);
      expect(actual).toEqual('2');

      actual = getLastAnsweredQuestionId(categories[1], answers);
      expect(actual).toEqual('49');
    });

    it('should return undefined there are no answers for the particular category', () => {
      const actual = getLastAnsweredQuestionId(categories[3], answers);
      expect(actual).toEqual(undefined);
    });
  });

  describe('resolveInitialCardIndex', () => {
    it('should return startFrom value if there are no answer to the category', () => {
      expect(resolveInitialCardIndex({} as Category, [], -1)).toBe(-1);
      expect(resolveInitialCardIndex({} as Category, [], 0)).toBe(0);
    });

    it('should return the index of the card whose question is the last one answered in the category plus one', () => {
      const category: any = { questions: [{ id: '1' }, { id: '2' }] };
      const cards: any = [
        { type: CardType.QUESTION, question: { id: '1' } },
        { type: CardType.QUESTION, question: { id: '2' } },
      ];

      expect(resolveInitialCardIndex(category, cards, -1, '1')).toBe(1);
    });

    it('should return startFrom value if all the questions are answered', () => {
      const category: any = { questions: [{ id: '1' }, { id: '2' }] };
      const cards: any = [
        { type: CardType.QUESTION, question: { id: '1' } },
        { type: CardType.QUESTION, question: { id: '2' } },
      ];

      expect(resolveInitialCardIndex(category, cards, -1, '2')).toBe(-1);
      expect(resolveInitialCardIndex(category, cards, 0, '2')).toBe(0);
    });
  });

  describe('isCategoryLocked', () => {
    it("should return true if category's state is COMPLETED", () => {
      expect(isCategoryLocked({ state: CategoryState.COMPLETED } as any)).toBe(
        true
      );
    });

    it("should return true if category's state is APPROVED", () => {
      expect(isCategoryLocked({ state: CategoryState.APPROVED } as any)).toBe(
        true
      );
    });

    it("should return false if category's state is other than COMPLETED or APPROVED", () => {
      expect(isCategoryLocked({ state: CategoryState.UNLOCKED } as any)).toBe(
        false
      );
    });
  });
});
