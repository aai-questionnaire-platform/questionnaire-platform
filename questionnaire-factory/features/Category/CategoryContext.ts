import { Context, createContext, useContext } from 'react';

import { CategoryComponent } from '@/schema/Components';
import { Answer, Category, Progress, Questionnaire } from '@/types';

interface ICategoryContext {
  questionnaire: Questionnaire;
  category: Category;
  answers: Answer[];
  progress: Progress;
  config: Omit<CategoryComponent['props'], 'children'>;
  userSettings: Record<string, any>;
}

export const CategoryContext: Context<ICategoryContext> = createContext(
  {} as ICategoryContext
);

export const useCategoryContext = () => useContext(CategoryContext);
