import * as R from 'ramda';
import { Category } from '../../types';
import { CategoryFormValues } from './types';

export const formatMultiLine = R.pipe<any, any, string[]>(
  R.path(['target', 'value']),
  (value) => [value]
);

export const toCategoryDto = (
  values: CategoryFormValues,
  category: Category
) => ({
  ...values,
  ...R.pick(['id', 'uuid', 'questionnaireUuid'], category),
});
