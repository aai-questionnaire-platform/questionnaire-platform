import { ORGANIZATON_TYPE } from './enums';

declare global {
  interface Window {
    Cypress?: any;
  }
}

export type Dict<T> = Record<string, T>;

export interface WebinyModel {
  id: string;
  entryId: string;
  uuid: string;
  createdOn?: Date | string;
  gameUuid?: string;
  meta?: any;
}

export interface Organization extends WebinyModel {
  type: ORGANIZATON_TYPE;
  name: string;
  parentUuid: string;
}

/**
 * Generic interface for questionnaires, which contain categorized option-based questions
 */
export interface Questionnaire extends WebinyModel {
  title: string;
  author: string;
  locale: string;
}

/**
 * Question category, e.g. "My life"; basically a list of questions to be asked in sequence
 */
export interface Category extends WebinyModel {
  description: string;
  questionnaireUuid: string;
  entryMessages: string[];
  exitMessages: string[];
  sortIndex: number;
}

export interface Question extends WebinyModel {
  categoryUuid: string;
  label: string;
  typeUuid: string;
  exitMessage?: string;
  sortIndex: number;
  topicUuid?: string;
  tags: string[];
}

export interface Option extends WebinyModel {
  label: string;
  value: string;
  questionUuid: string;
  sortIndex: number;
}

export interface Topic extends WebinyModel {
  label: string;
  value: string;
}

export interface QuestionType extends WebinyModel {
  label: string;
}

export interface Group extends WebinyModel {
  name: string;
  organizationUuid: string;
  pin: string;
  valid_until?: Date;
  valid_from?: Date;
  groupAdmins: User[];
}

export interface User {
  email: string;
  name: string;
  id?: string;
  organization_id?: string;
  group_ids?: string[];
  removed?: boolean;
}

type Dto<T> = Omit<T, 'id' | 'entryId'>;

export type CategoryDto = Dto<Category>;

export interface Data<T> {
  data: T;
}

export interface QuestionnaireQueryResult {
  listQuestionnaires: Data<Questionnaire[]>;
  listCategories: Data<Category[]>;
  listQuestions: Data<Question[]>;
  listTopics: Data<Topic[]>;
  listQuestionTypes: Data<QuestionType[]>;
}

export type OptionDto = Dto<Option>;

export type QuestionDto = Dto<Question> & {
  options: Option[] | OptionDto[];
};

export type LoadingState = 'idle' | 'loading' | 'error';
