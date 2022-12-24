import React from 'react';
import { QuestionnaireQueryResult } from './types';

interface TQuestionnaireContext {
  query: QuestionnaireQueryResult;
  questionnaireId: string;
  categoryId: string;
}

export const QuestionnaireContext = React.createContext<TQuestionnaireContext>({
  query: {} as QuestionnaireQueryResult,
  questionnaireId: '',
  categoryId: '',
});

interface TQuestionsContext {
  sortIndex: number;
}

export const QuestionsContext = React.createContext<TQuestionsContext>({
  sortIndex: 0,
});
