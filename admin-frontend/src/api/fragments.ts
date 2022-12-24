import gql from 'graphql-tag';

export const GROUP_PARTS = gql`
  fragment GroupParts on Group {
    id
    entryId
    uuid
    name
    organizationUuid
    pin
    validFrom
    validUntil
    groupAdmins
    gameUuid
  }
`;

export const CATEGORY_PARTS = gql`
  fragment CategoryParts on Category {
    id
    entryId
    uuid
    questionnaireUuid
    description
    entryMessages
    exitMessages
    gameUuid
    sortIndex
    meta {
      status
    }
  }
`;

export const QUESTION_PARTS = gql`
  fragment QuestionParts on Question {
    id
    entryId
    uuid
    label
    typeUuid
    topicUuid
    categoryUuid
    gameUuid
    sortIndex
    tags
    meta {
      status
    }
  }
`;

export const OPTION_PARTS = gql`
  fragment OptionParts on Option {
    id
    entryId
    uuid
    label
    value
    questionUuid
    sortIndex
    gameUuid
    meta {
      status
    }
  }
`;
