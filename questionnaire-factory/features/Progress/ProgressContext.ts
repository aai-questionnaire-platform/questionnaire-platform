import { createContext, useContext, Context } from 'react';

import { ProgressComponent } from '@/schema/Components';
import { CategoryWithProgress } from '@/types';

interface IProgressContext {
  categories: CategoryWithProgress[];
  config: Omit<ProgressComponent['props'], 'children'>;
}

export const ProgressContext: Context<IProgressContext> = createContext(
  {} as IProgressContext
);

export const useProgressContext = () => useContext(ProgressContext);
