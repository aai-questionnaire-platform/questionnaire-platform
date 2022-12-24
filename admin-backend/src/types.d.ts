export type Dict<T> = Record<string, T>;

export type Dto<T> = Omit<T, 'id' | 'entryId'>;

export interface WebinyModel {
  id: string;
  entryId: string;
  uuid: string;
  createdOn?: Date | string;
  deletedAt?: Date | string;
  editedBy?: string;
  gameUuid: string | undefined;
  meta?: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organization_id?: string;
  group_ids?: string[];
  removed?: boolean;
}

export interface Group extends WebinyModel {
  name: string;
  organizationUuid: string;
  pin?: string;
  validUntil?: Date | null;
  validFrom?: Date;
}

export interface PostGroupPayload extends Group {
  groupAdmins?: User[];
}

export interface Question extends WebinyModel {
  categoryUuid: string;
  label: string;
  typeUuid: string;
  exitMessage?: string;
  questionnaireRevision?: string;
  sortIndex: number;
  topicUuid?: string;
  tags: string[];
}

export interface Option extends WebinyModel {
  label: string;
  value: string;
  questionUuid: string;
  sortIndex: number;
  questionnaireRevision?: string;
}

export interface Category extends WebinyModel {
  description: string;
  questionnaireUuid: string;
  entryMessages: string[];
  exitMessages: string[];
  sortIndex: number;
  questionnaireRevision?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  image?: string;
}
export interface Questionnaire extends WebinyModel {
  title: string;
  author: string;
  locale: string;
}

export interface Topic extends WebinyModel {
  label: string;
  value: string;
}

export interface QuestionType extends WebinyModel {
  label: string;
  answerType: string;
}

type QuestionPayload<T> = T & {
  options: Dto<Option>[];
};

export type CreateQuestionPayload = QuestionPayload<Dto<Question>>;
export type UpdateQuestionPayload = QuestionPayload<Question>;

export interface UpdateUserProps {
  username: string;
  name?: string;
  groupIds?: string;
  organizationIds?: string;
}
