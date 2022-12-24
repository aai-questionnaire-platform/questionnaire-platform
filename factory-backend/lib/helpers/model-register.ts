import { Model, IRestApi, ModelOptions } from '@aws-cdk/aws-apigateway';
import { getAnswerSetModelOptions } from '../schemas/answer-set';
import { getAnswerSetsModelOptions } from '../schemas/answer-sets';
import {
  getGroupsModelOptions,
  getOrganizationsModelOptions,
} from '../schemas/organizations';
import {
  getPostQuestionnaireRequestModelOptions,
  getQuestionnaireModelOptions,
} from '../schemas/questionnaire';
import { getAnswerSummaryModelOptions } from '../schemas/answersummary';
import { getProgressModelOptions } from '../schemas/progress';
import { getPostProgressModelOptions } from '../schemas/postprogress';
import { Stack } from '@aws-cdk/core';
import { getNewGroupRequestModelOptions } from '../schemas/newgrouprequest';
import { getErrorResponse } from '../schemas/errorresponse';
import { getPostGroupMemberRequest } from '../schemas/postgroupmemberrequest';

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
    //Add questionnaire model to api
    this.registered_models.set(
      'GetQuestionnaire',
      this.getSingleModel(
        scope,
        'GetQuestionnaire',
        api,
        getQuestionnaireModelOptions()
      )
    );
    //Add post questionnaire model to api
    this.registered_models.set(
      'PostQuestionnaire',
      this.getSingleModel(
        scope,
        'PostQuestionnaire',
        api,
        getPostQuestionnaireRequestModelOptions()
      )
    );

    //Add organizations model to api
    this.registered_models.set(
      'GetOrganizations',
      this.getSingleModel(
        scope,
        'GetOrganizations',
        api,
        getOrganizationsModelOptions()
      )
    );

    //Add post answers model to api
    this.registered_models.set(
      'PostAnswers',
      this.getSingleModel(scope, 'PostAnswers', api, getAnswerSetModelOptions())
    );

    //Add get answers model to api
    this.registered_models.set(
      'GetAnswers',
      this.getSingleModel(scope, 'GetAnswers', api, getAnswerSetsModelOptions())
    );

    //Add get answers model to api
    this.registered_models.set(
      'GetAnswerSummary',
      this.getSingleModel(
        scope,
        'GetAnswerSummary',
        api,
        getAnswerSummaryModelOptions()
      )
    );

    //Add get answers model to api
    this.registered_models.set(
      'GetProgress',
      this.getSingleModel(scope, 'GetProgress', api, getProgressModelOptions())
    );

    //Add get groups model to api
    this.registered_models.set(
      'GetGroups',
      this.getSingleModel(scope, 'GetGroups', api, getGroupsModelOptions())
    );

    //Add post groups model to api
    this.registered_models.set(
      'PostGroups',
      this.getSingleModel(
        scope,
        'PostGroups',
        api,
        getNewGroupRequestModelOptions()
      )
    );

    this.registered_models.set(
      'PostProgress',
      this.getSingleModel(
        scope,
        'PostProgress',
        api,
        getPostProgressModelOptions()
      )
    );

    this.registered_models.set(
      'PostGroupMember',
      this.getSingleModel(
        scope,
        'PostGroupMember',
        api,
        getPostGroupMemberRequest()
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
        schema: modelOptions.schema,
        modelName: modelOptions.modelName,
        description: modelOptions.description,
      }
    );
  }
}
