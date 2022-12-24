import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { Option, OptionDto } from '../../types';

const mapIndexed = R.addIndex(R.map);

/**
 * Format options array's errors so that they are unified with other errors
 * @param errors
 * @returns
 */
export const flattenOptionErrors = R.pipe<
  Record<string, any>,
  any[],
  any[],
  any
>(
  R.propOr([], 'options'),
  mapIndexed(
    (optionError: any, i) =>
      optionError && {
        ...optionError.label,
        index: i + 1,
      }
  ),
  R.filter(Boolean)
);

export const resolveNextSortIndex = R.pipe(
  R.map(R.prop('sortIndex')),
  R.reduce<{ sortIndex: number }, number>(R.max, 0),
  R.add(1)
);

export const createOptionForQuestion = (
  questionUuid: string,
  existing: (Option | OptionDto)[]
): OptionDto => {
  const uuid = uuidv4();
  return {
    uuid,
    questionUuid,
    label: '',
    value: uuid,
    sortIndex: resolveNextSortIndex(existing),
  };
};
