import { Model, IRestApi, ModelOptions } from '@aws-cdk/aws-apigateway';
import { Stack } from '@aws-cdk/core';
import { getErrorResponse } from '../schemas/errorresponse';

export class ModelRegister {
  registered_models: Map<string, Model> = new Map<string, Model>();

  getModel(id: string): Model {
    return this.registered_models.get(id)!;
  }

  /**
   * Registers models used to document the api & response/request validation to the API
   * @param api
   */
  registerModels(scope: Stack, api: IRestApi) {
    //TODO

    this.registered_models.set(
      'ErrorResponse',
      this.getSingleModel(scope, 'ErrorResponse', api, getErrorResponse())
    );
  }

  getSingleModel(
    scope: Stack,
    modelId: string,
    restAPI: IRestApi,
    modelOptions: ModelOptions
  ): Model {
    return new Model(
      scope,
      modelId,

      {
        restApi: restAPI,
        contentType: 'application/json',
        schema: modelOptions.schema,
        modelName: modelOptions.modelName,
        description: modelOptions.description,
      }
    );
  }
}
