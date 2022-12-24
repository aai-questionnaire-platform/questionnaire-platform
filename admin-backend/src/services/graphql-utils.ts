import { gql } from '@apollo/client/core';
import { print } from 'graphql/language/printer';
import * as R from 'ramda';

const findDataSelection = (selectionSet: any): any => {
  const dataSelection = selectionSet.selections.find(
    (selection: any) =>
      selection.kind == 'Field' && selection.name.value == 'data'
  );
  if (dataSelection) {
    return dataSelection.selectionSet;
  }
  if (!dataSelection && dataSelection.selections?.length > 0) {
    return findDataSelection(selectionSet.selections);
  }
  return null;
};

export const isAttributeInQuery = (query: any, attributeName: string) => {
  try {
    const parsedQuery = gql`
      ${query}
    `;
    const attributes: Record<string, string[]> = {};
    const fragments: Record<string, string[]> = {};
    parsedQuery.definitions.forEach((definition) => {
      if (definition.kind == 'OperationDefinition') {
        definition.selectionSet.selections.forEach((selection: any) => {
          attributes[selection.name.value] = findDataSelection(
            selection.selectionSet
          )?.selections.map((dataSelection: any) => dataSelection.name.value);
        });
      } else if (definition.kind == 'FragmentDefinition') {
        fragments[definition.name.value] =
          definition.selectionSet.selections.map(
            (selection: any) => selection.name.value
          );
      }
    });

    let attributeFound = true;

    //If any of the attributesets does not contain required attribute, return false
    for (const [key, value] of Object.entries(attributes)) {
      if (!value?.includes(attributeName)) {
        attributeFound = value.length
          ? fragments[value[0]]?.includes(attributeName)
          : false;
        if (!attributeFound) {
          console.debug(`attributeName ${attributeName} missing from ${key}`);
          break;
        }
      }
    }

    return attributeFound;
  } catch (e) {
    console.error('Parsing query-attributes failed', e);
    return true;
  }
};

export const filterResults = (response: any, gameUuids: Array<any>) => {
  const allowedGameUuids = [...gameUuids, '*'];
  for (const listResultKey in response.data) {
    const resultDataLens = R.lensPath(['data', listResultKey, 'data']);
    const responseData = R.view(resultDataLens, response);
    if (Array.isArray(responseData)) {
      response = R.over(
        resultDataLens,
        R.filter(
          R.allPass([
            R.either(
              R.propEq('deletedAt', null),
              R.propEq('deletedAt', undefined)
            ),
            (model: any) => R.includes(model.gameUuid, allowedGameUuids),
          ])
        ),
        response
      );
    } else if (
      responseData?.deletedAt ||
      !R.includes(responseData?.gameUuid, allowedGameUuids)
    ) {
      response = R.set(resultDataLens, null, response);
    }
  }

  return response;
};

export const addQueryAttributes = (query: any, attributes: Array<string>) => {
  try {
    let parsedQuery = gql`
      ${query}
    `;

    const newAttributes = attributes.map((attribute) => {
      return {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: attribute,
        },
        arguments: [],
        directives: [],
      };
    });

    const selectionsLens = R.lensPath(['selectionSet', 'selections']);

    const lensMatching =
      (pred: any) => (toF: any) => (entities: Array<any>) => {
        const index = R.findIndex(pred, entities);
        return R.map(
          (entity) => R.update(index, entity, entities),
          toF(entities[index])
        );
      };

    const lensByKind: any = R.compose(lensMatching, R.propEq('kind'));

    const concatAfter = R.flip(R.concat);

    parsedQuery = R.over(
      R.compose(
        R.lensProp<any>('definitions'),
        lensByKind('OperationDefinition'),
        selectionsLens
      ),
      R.map(
        R.over(
          selectionsLens,
          R.map(
            R.when(
              R.propEq('name', { kind: 'Name', value: 'data' }),
              R.over(selectionsLens, concatAfter(newAttributes))
            )
          )
        )
      ),
      parsedQuery
    );
    return print(parsedQuery);
  } catch (e) {
    console.error('Parsing query-attributes failed', e);
    return true;
  }
};
export const getGetQuery = (modelName: string, attributes: Array<string>) => {
  return gql`
  query Get${modelName}($revision: ID!) {
    get${modelName}(revision: $revision) {
      data {
        ${attributes.join(' \n ')}
      }
      error {
        code
        message
      }
    }
  }`;
};

export const getListQueryWhere = (
  modelName: string,
  listName: string,
  attributes: Array<string>
) => {
  return gql`
  query List${modelName}s($where: ${modelName}ListWhereInput) {
    list${listName}(where: $where, limit: 1000) {
      data {
        ${attributes.join(' \n ')}
      }
      error {
        code
        message
      }
    }
  }`;
};

export const getCreateFromMutation = (modelName: string) => {
  return gql`
  mutation Create${modelName}From($revision: ID!, $data: ${modelName}Input!) {
    create${modelName}From(revision: $revision, data: $data) {
      data {
        id
        uuid
        deletedAt
        gameUuid
      }
      error {
        code
        message
      }
    }
  }`;
};

export const getUpdateMutation = (modelName: string) => {
  return gql`
  mutation Update${modelName}($revision: ID!, $data: ${modelName}Input!) {
    update${modelName}(revision: $revision, data: $data) {
      data {
        id
        uuid
        deletedAt
        gameUuid
      }
      error {
        code
        message
      }
    }
  }`;
};

export const getPublishMutationWithParts = (
  modelName: string,
  parts: string
) => {
  return gql`
  ${parts}
  mutation Publish${modelName}($revision: ID!) {
    publish${modelName}(revision: $revision) {
      data {
        ...${modelName}Parts
      }
      error {
        code
        message
      }
    }
  }`;
};

export const getPublishMutation = (modelName: string) => {
  return gql`
  mutation Publish${modelName}($revision: ID!) {
    publish${modelName}(revision: $revision) {
      data {
        id
        uuid
        deletedAt
        gameUuid
      }
      error {
        code
        message
      }
    }
  }`;
};
