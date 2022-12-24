import * as R from 'ramda';
import { setLocale } from 'yup';
import { LocaleObject } from 'yup/lib/locale';

const convertToFieldTranslation = R.curry(
  (fieldNameMappings: Record<string, string>, n: string) => {
    for (let key in fieldNameMappings) {
      if (key === n) {
        return fieldNameMappings[n];
      }

      if (new RegExp(`^${key}$`).test(n)) {
        return fieldNameMappings[key];
      }
    }

    return n;
  }
);

const getLocales = (
  fieldNameMappings: Record<string, string> = {}
): LocaleObject => {
  const convert = convertToFieldTranslation(fieldNameMappings);
  return {
    mixed: {
      required: ({ path }) => ({
        field: convert(path),
        error: 'required',
      }),
    },
    string: {
      min: ({ path, min }) => ({
        field: convert(path),
        error: 'minLength',
        min,
      }),
      email: ({ path }) => ({
        field: convert(path),
        error: 'email',
      }),
    },
  };
};

export const setValidationsLocales = R.pipe<
  Record<string, string> | undefined,
  LocaleObject,
  void
>(getLocales, setLocale);
