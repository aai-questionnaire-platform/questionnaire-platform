import { Model, IRestApi, ModelOptions } from '@aws-cdk/aws-apigateway';
import { Stack } from '@aws-cdk/core';
import { getCreateUserRequestModelOptions } from '../schemas/createuserrequest';
import { getErrorResponse } from '../schemas/errorresponse';

export class ModelRegister {
  registered_models: Map<string, Model> = new Map<string, Model>();

  getModel(id: string): Model {
    const model = this.registered_models.get(id);

    if (!model) {
      throw new Error(`No such model ${id}`);
    }

    return model;
  }

  /**
   * Registers models used to document the api & response/request validation to the API
   * @param api
   */
  registerModels(scope: Stack, api: IRestApi) {
    this.registered_models.set(
      'PostUser',
      this.getSingleModel(
        scope,
        'PostUser',
        api,
        getCreateUserRequestModelOptions()
      )
    );

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
        ...modelOptions,
      }
    );
  }
}
