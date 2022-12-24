import {
  CfnDocumentationPart,
  MethodOptions,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

export function createGetQuestionnaireHandler(
  scope: Construct,
  importedBucket: s3.IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const getQuestionnaireHandler = new NodejsFunction(
    scope,
    'Most recent common questionnaire supported by Questionnaire Factory',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-questionnaires.ts',
      handler: 'getQuestionnaire',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ASSETS_BUCKET_NAME: importedBucket.bucketName,
      },
    }
  );

  getQuestionnaireHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to bucket
  importedBucket.grantReadWrite(getQuestionnaireHandler);

  const method = 'GET';
  const path = 'questionnaire';

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetQuestionnaireAPIdocs(scope, path, method, apiHelper);
  }

  const validator = new RequestValidator(
    scope,
    'FactoryGetQuestionnaireValidator',
    {
      requestValidatorName: `FactoryGetQuestionnaireValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: false,
      validateRequestParameters: true,
    }
  );

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestParameters: { 'method.request.querystring.locale': true },
    methodResponses: commonResponses(register, 'GetQuestionnaire'),
  };

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    path,
    getQuestionnaireHandler,
    { type: AuthType.NONE },
    endPointParameters
  );

  // register to group admin API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${path}`,
    getQuestionnaireHandler,
    { type: AuthType.COGNITO },
    endPointParameters
  );

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${path}`,
    getQuestionnaireHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}

export function createPostQuestionnaireHandler(
  scope: Construct,
  importedBucket: s3.IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const postQuestionnaireHandler = new NodejsFunction(
    scope,
    'Publish new questionnaire',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-questionnaire.ts',
      handler: 'postQuestionnaire',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ASSETS_BUCKET_NAME: importedBucket.bucketName,
      },
    }
  );

  postQuestionnaireHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to bucket
  importedBucket.grantReadWrite(postQuestionnaireHandler);

  const method = 'POST';
  const path = 'questionnaire';

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetQuestionnaireAPIdocs(scope, path, method, apiHelper);
  }

  const validator = new RequestValidator(
    scope,
    'FactoryPostQuestionnaireValidator',
    {
      requestValidatorName: `FactoryPostQuestionnaireValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: true,
      validateRequestParameters: false,
    }
  );

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: {
      'application/json': register.getModel('PostQuestionnaire'),
    },
    methodResponses: commonResponses(register),
  };

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${path}`,
    postQuestionnaireHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}

function generateGetQuestionnaireAPIdocs(
  construct: Construct,
  path: string,
  method: string,
  api: ApiGatewayHelper
) {
  new CfnDocumentationPart(construct, path + '-' + method + '-doc-method', {
    location: {
      type: 'METHOD',
      method: method,
      path: path,
    },
    properties: JSON.stringify({
      status: 'succesful',
      code: 200,
      message: method + ' was succesful',
      description: 'A list of questions by category',
    }),
    restApiId: api.api.restApiId,
  });

  //Create method parameter documentation
  new CfnDocumentationPart(
    construct,
    path + '-' + method + 'user_id' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'locale',
      },
      properties: JSON.stringify({ description: 'Desired output language' }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(construct, path + '-' + method + '-doc-body', {
    location: {
      type: 'RESPONSE_BODY',
      method: method,
      path: path,
    },
    properties: JSON.stringify({ description: 'List of questions' }),
    restApiId: api.api.restApiId,
  });
}
