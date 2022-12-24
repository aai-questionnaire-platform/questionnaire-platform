import { MutationFunctionOptions } from '@apollo/client';
import * as R from 'ramda';

export const createMutateOptions = <T>(
  id: string | undefined,
  content: T
): MutationFunctionOptions<T> => {
  return {
    variables: {
      ...(id && { revision: id }),
      data: content,
    },
  };
};

const STRING_LIST_SEPARATOR = ', ';

/**
 * Add a new entry to a string containing [STRING_LIST_SEPARATOR] separated list of values.
 * Add every value once like a Set should. Removes empty values.
 * @param entry
 * @param list
 * @returns
 */
export const addToStringSet = (entry: string, list: string[] = []) =>
  R.pipe(
    R.without([entry]),
    R.append(entry),
    R.filter(Boolean),
    R.join(STRING_LIST_SEPARATOR)
  )(list);

/**
 * Split string by [STRING_LIST_SEPARATOR]. Removes empty values.
 * @param list
 * @returns
 */
export const toStringSet = (list = '') =>
  R.filter(Boolean, R.split(STRING_LIST_SEPARATOR, list));

/**
 * Convert a list of strings to a string of [STRING_LIST_SEPARATOR] separated values.
 * @param list
 * @returns
 */
export const arrayToListString = (list: string[] = []) =>
  list.filter(Boolean).join(STRING_LIST_SEPARATOR);

/**
 * Check if a list of strings contains given
 * @param groupId
 * @returns
 */
export const isInList = R.curry(<T>(needle: T, haystack: T[]) =>
  haystack.includes(needle)
);

export const createTimestampWithTimezone = () => {
  return new Date().toISOString().replace('Z', '+00:00');
};

export const parseGameInstances = (gameInstances: any) => {
  if (!gameInstances.includes('apikey')) {
    return JSON.parse(gameInstances);
  }
  const apikeys = gameInstances
    .match(/<apikey>(.*?)<\/apikey>/g)
    .map((val: string) => val.replace(/<\/?apikey>/g, ''));

  let escapedContent = gameInstances;
  for (const apikey of apikeys) {
    escapedContent = escapedContent.replace(
      `<apikey>${apikey}</apikey>`,
      // eslint-disable-next-line no-useless-escape
      apikey.replace(/[\"]/g, '\\"')
    );
  }
  return JSON.parse(escapedContent);
};

export const isDraft = R.pathEq(['meta', 'status'], 'draft');
export const isPublished = R.pathEq(['meta', 'status'], 'published');
