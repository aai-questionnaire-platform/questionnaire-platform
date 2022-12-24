import { createContext, useContext, Context } from 'react';

import { AnswerSummaryComponent } from '@/schema/Components';
import { Answer, AnswerSummaryData, Category, Questionnaire } from '@/types';

interface IAnswerSummaryContext {
  questionnaire: Questionnaire;
  category: Category;
  categoryIndex: number;
  answers: Answer[];
  config: Omit<AnswerSummaryComponent['props'], 'children'>;
  userSettings: Record<string, string>;
  answerSummary: AnswerSummaryData;
}

export const AnswerSummaryContext: Context<IAnswerSummaryContext> =
  createContext({} as IAnswerSummaryContext);

export const useAnswerSummaryContext = () => useContext(AnswerSummaryContext);
