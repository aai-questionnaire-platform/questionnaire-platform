import { gql } from '@apollo/client';
import {
  CATEGORY_PARTS,
  GROUP_PARTS,
  OPTION_PARTS,
  QUESTION_PARTS,
} from './fragments';

const MAX_RESULT_LIMIT = 10000;

export const QUESTIONNAIRE_TITLES = gql`
  query getQuestionaireTitles {
    listQuestionnaires(limit: ${MAX_RESULT_LIMIT}) {
      data {
        id
        uuid
        entryId
        title
        uuid
      }
    }
  }
`;

export const QUESTIONNAIRE = gql`
  ${CATEGORY_PARTS}
  ${QUESTION_PARTS}
  query GetQuestionnaire($uuid: String) {
    listQuestionnaires(where: { uuid: $uuid }) {
      data {
        id
        entryId
        uuid
        createdOn
        title
        author
        locale
        gameUuid
        meta { status }
      }
    }

    listCategories(limit: ${MAX_RESULT_LIMIT}) {
      data {
        ...CategoryParts
        meta { status }
      }
    }

    listQuestions(limit: ${MAX_RESULT_LIMIT}) {
      data {
        ...QuestionParts
        meta { status }
      }
    }

    listTopics(limit: ${MAX_RESULT_LIMIT}) {
      data {
        uuid
        label
        value
        gameUuid
      }
    }

    listQuestionTypes(limit: ${MAX_RESULT_LIMIT}) {
      data {
        uuid
        label
        gameUuid
      }
    }
  }
`;

export const LIST_ORGANIZATIONS = gql`
  query ListOrganizations {
    listOrganizations(limit: ${MAX_RESULT_LIMIT}) {
      data {
        entryId
        id
        uuid
        parentUuid
        name
        type
      }
    }
  }
`;

export const LIST_GROUPS = gql`
  ${GROUP_PARTS}
  query ListGroups($parentId: String!) {
    listGroups(where: { organizationUuid: $parentId }, limit: ${MAX_RESULT_LIMIT}) {
      data {
        ...GroupParts
      }
    }
  }
`;

export const LIST_OPTIONS = gql`
  ${OPTION_PARTS}
  query ListOptions($questionUuid: String) {
    listOptions(where: { questionUuid: $questionUuid }, limit: ${MAX_RESULT_LIMIT}) {
      data {
        ...OptionParts
        meta { status }
      }
    }
  }
`;
