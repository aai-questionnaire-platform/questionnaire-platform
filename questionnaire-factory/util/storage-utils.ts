import { Answer } from '@/types';

export const save = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, data);
    } catch (e) {
      console.error('failed');
    }
  }
};

export const load = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch (_e) {
      return undefined;
    }
  }

  return undefined;
};

export const remove = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.removeItem(key);
    } catch (_e) {
      return undefined;
    }
  }

  return undefined;
};

const LOCAL_QUESTIONNAIRE_ANSWERS_KEY = 'local-kysely-answers';

export const loadAnswers = () =>
  JSON.parse(load(LOCAL_QUESTIONNAIRE_ANSWERS_KEY) || '[]') as Answer[];

export const saveAnswers = (answers: Answer[]) =>
  save(LOCAL_QUESTIONNAIRE_ANSWERS_KEY, JSON.stringify(answers));

export const removeAnswers = () => remove(LOCAL_QUESTIONNAIRE_ANSWERS_KEY);

const LOCAL_CALLBACK_URL = 'local-callback-url';

export const saveLocalCallbackUrl = (url: any) => save(LOCAL_CALLBACK_URL, url);

export const loadLocalCallbackUrl = () => load(LOCAL_CALLBACK_URL);
