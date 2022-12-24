import { gql, MutationFunctionOptions } from '@apollo/client';
import { CATEGORY_PARTS, GROUP_PARTS, QUESTION_PARTS } from './fragments';

export const CREATE_GROUP = gql`
  ${GROUP_PARTS}
  mutation CreateAndPublishGroup($data: GroupInput!) {
    createAndPublishGroup(data: $data) {
      data {
        ...GroupParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_GROUP = gql`
  ${GROUP_PARTS}
  mutation UpdateAndPublishGroup($revision: ID!, $data: GroupInput!) {
    updateAndPublishGroup(revision: $revision, data: $data) {
      data {
        ...GroupParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const REMOVE_GROUP = gql`
  mutation DeleteGroup($revision: ID!) {
    deleteGroup(revision: $revision) {
      data
      error {
        code
        message
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  ${CATEGORY_PARTS}
  mutation CreateCategory($data: CategoryInput!) {
    createCategory(data: $data) {
      data {
        ...CategoryParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  ${CATEGORY_PARTS}
  mutation UpdateCategory($revision: ID!, $data: CategoryInput!) {
    updateCategory(revision: $revision, data: $data) {
      data {
        ...CategoryParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation DeleteCategory($revision: ID!) {
    deleteCategory(revision: $revision) {
      data
      error {
        code
        message
      }
    }
  }
`;

export const CREATE_QUESTION = gql`
  ${QUESTION_PARTS}
  mutation CreateQuestion($data: QuestionInput!) {
    createQuestion(data: $data) {
      data {
        ...QuestionParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const UPDATE_QUESTION = gql`
  ${QUESTION_PARTS}
  mutation UpdateQuestion($revision: ID!, $data: QuestionInput!) {
    updateQuestion(revision: $revision, data: $data) {
      data {
        ...QuestionParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const REMOVE_QUESTION = gql`
  mutation DeleteQuestion($revision: ID!) {
    deleteQuestion(revision: $revision) {
      data
      error {
        code
        message
      }
    }
  }
`;

export const SORT_CATEGORIES = gql`
  ${CATEGORY_PARTS}
  mutation SortCategories($data: [CategoryInput]!) {
    sortCategories(data: $data) {
      data {
        ...CategoryParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const SORT_QUESTIONS = gql`
  ${QUESTION_PARTS}
  mutation SortQuestions($data: [QuestionInput]!) {
    sortQuestions(data: $data) {
      data {
        ...QuestionParts
      }
      error {
        code
        message
      }
    }
  }
`;

export const PUBLISH_QUESTIONNAIRE = gql`
  mutation PublishQuestionnaire($data: QuestionnaireInput!) {
    publishQuestionnaire(data: $data) {
      data {
        id
      }
      error {
        code
        message
      }
    }
  }
`;

export const ROLLBACK_QUESTIONNAIRE = gql`
  mutation RollbackQuestionnaire($data: QuestionnaireInput!) {
    rollbackQuestionnaire(data: $data) {
      data
      error {
        code
        message
      }
    }
  }
`;

export function getMutationParams<T>(entity: T) {
  const { id, ...content } = entity as { id?: string };
  return createMutateOptions<T>(id, content as T);
}

function createMutateOptions<T>(
  id: string | undefined,
  content: T
): MutationFunctionOptions<T> {
  return {
    variables: {
      ...(id && { revision: id }),
      data: content,
    },
    context: { clientName: 'manage' },
  };
}
