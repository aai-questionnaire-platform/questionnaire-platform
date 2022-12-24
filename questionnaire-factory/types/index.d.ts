import { AppMeta, AppRoute, AppStructure } from '../schema/AppStructure';
import { Theme } from './schema/Theme';

export interface AppStaticProps {
  appProps: AppStructure & {
    translations: Record<string, any>;
    version: string;
  };
  routeProps: AppRoute & { theme: Theme };
}

interface AppMetaWithAppId extends AppMeta {
  appId: string;
}

/**
 * Represents an organization, e.g. "Hiippakunta"
 * The organization may define zero or more "children" e.g. Hiippakunta may have several seurakuntas below it,
 * which may define zero or more active "rippikoulus" beneath.
 */
export interface Organization {
  id: string;
  /**
   * Organization type (localized), e.g. "Hiippakunta", "Seurakunta", "Rippikouluryhmä"
   */
  type: string;
  /**
   * Organization name (localized), e.g. "Pohjois-Suomi", "Rovaniemi", "Juhannusryhmä 1"
   */
  name: string;
  /**
   * Last date until a group is valid (selectable), null if unspecified
   */
  valid_until?: Date;
  /**
   * Frisdt date until a group is valid (selectable), null if unspecified
   */
  valid_from?: Date;
  /**
   * Children, if any, e.g. Hiippakunta -> number of seurakuntas -> number of rippikoulu groups
   */
  children?: Organization[];
}

export interface Group {
  id: string;
  name: string;
  parent_organization_id: string;
  pin: string;
  valid_until?: string;
  valid_from?: string;
}

/**
 * Generic interface for questionnaires, which contain categorized option-based questions
 */
export interface Questionnaire {
  id: string; //The "primary key"
  title: string;
  author: string;
  locale: string;
  version: number;
  date_written: Date;
  categories: Category[];
}

export interface CategoryData {
  entryMessages?: string[];
  exitMessages?: string[];
}

/**
 * Question category, e.g. "My life"; basically a list of questions to be asked in sequence
 */
export interface Category {
  id: string; //The "primary key"
  description: string;
  questions: Question[];
  //Optional, additional data
  data: CategoryData;
  type?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  image?: string;
}

/**
 * Meta information about category's progress
 */
export interface Progress {
  questionnaire_id: string;
  organization_ids: string[];
  category_statuses: CategoryStatus[];
  user_id?: string;
  groupMemberCount?: number;
  completionCounts?: { [categoryId: string]: number };
}

/**
 * Category with categoty progress related props
 */
export type CategoryWithProgress = Category & {
  state: CategoryState;
  completionCount?: number;
  groupMemberCount?: number;
};

export interface AnswerSummary {
  answers_by_question: AnswerByQuestion[];
  category_id: string;
  organization_id: string[];
  questionnaire_id: string;
}

export interface AnswerByQuestion {
  answer_value: string;
  answer_count: number;
  question_id: string;
}

export interface AnswerSummaryData {
  categoryLabel: string;
  questions: AnswerSummaryQuestion[];
}

export interface AnswerSummaryQuestion {
  label: string;
  ownAnswer?: string;
  answers: AnswerSummaryOption[];
}

export interface AnswerSummaryOption extends Option {
  answerCount: number;
}

export type QuestionTag =
  | 'VALIDATE_ON_SAVE'
  | 'HN_REQUIRED'
  | 'HN_REQUIRED_GROUP';

/**
 * A question with one of more alternatives
 * Also attaches a topic
 */
export interface Question {
  id: string; //The "primary key"
  label: string;
  options: Option[];
  topic?: Topic;
  maxSelectedOptions?: number;
  description?: string;
  tags?: QuestionTag[];
}

/**
 * Alternative with display text and separate value option (e.g. "I'm good - 5")
 */
export interface Option {
  label: string;
  value: string;
}

/**
 * Classification of a question into a broader topic, like question is related to "Health"
 */
export interface Topic {
  label: string;
  value: string;
}

export interface Answer {
  question_id: string;
  answer_value: string;
}

/**
 * Answer set key structure
 */
export interface AnswerSetKey {
  /**
   * Ordered list of organizations, e.g. "[0]Kuopio[1]Tuomiokirkkosrk[2]Kesäryhmä1"
   */
  organization_ids: string[];

  /**
   * Link to a specific questionnaire
   */
  questionnaire_id: string;

  user_id?: string;
}

/**
 * Interface for answering a set of questions
 */
export interface AnswerSet {
  key: AnswerSetKey;
  answers: AnswerDto[];
  questionnaire_version: number;
}

export type ReducerAction<T, P extends Object = {}> = { type: T } & P;
