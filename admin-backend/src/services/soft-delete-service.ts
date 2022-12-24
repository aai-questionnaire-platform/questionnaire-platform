import { ApolloClient } from '@apollo/client/core';
import { createApolloClient } from '../api/graphql/apollo-client';
import { getCreateFromMutation } from './graphql-utils';
import { createTimestampWithTimezone } from './utils';

export class SoftDeleteService {
  private apolloClient: ApolloClient<any>;

  constructor() {
    this.apolloClient = createApolloClient('manage/fi-FI');
  }

  async deleteModel(revision: string, modelName: string) {
    console.info(
      `deleteModel(): Deleting model ${modelName} with revision ${revision}`
    );

    const deleteTimestamp = createTimestampWithTimezone();
    try {
      const variables = {
        revision: revision,
        data: { deletedAt: deleteTimestamp },
      };

      const updateModelResponse = await this.apolloClient.mutate({
        mutation: getCreateFromMutation(modelName),
        variables: variables,
      });
      console.log('updateModelResponse', updateModelResponse);

      if (updateModelResponse.errors) {
        throw Error(`Error: ${JSON.stringify(updateModelResponse.errors)}`);
      }

      const createdModel =
        updateModelResponse.data[`create${modelName}From`].data;

      return this.createResponse(modelName, { uuid: createdModel.uuid }, null);
    } catch (e: any) {
      console.error('deleteModel():', e);
      return this.createResponse(modelName, null, {
        code: '',
        message: e.message,
      });
    }
  }

  private createResponse(modelName: string, data: any, error: any) {
    const response: any = { data: {} };
    response.data[`delete${modelName}`] = {
      data: data,
      error: error,
      __typename: 'CmsDeleteResponse',
    };
    return response;
  }
}
