import { CardType } from '@/enums';
import { Answer, Category, Question } from '@/types';

export interface Card {
  type: CardType;
  index: number;
  questionIndex: number;
  description: string;
}

export interface ChantCard extends Card {
  message: string;
}

export interface QuestionCard extends Card {
  question: Question;
}

export interface QuestionCardProps {
  question: Question;
  category: Category;
  answers: Answer[];
  card: Card;
  selectAnswer: (answer: Answer) => void;
  isCategoryLocked: boolean;
  questionCount: number;
}
