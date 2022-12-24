import {
  CfnDocumentationPart,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { generateApiDocForMethod } from './generate-docs';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

const PROGRESS_API_ENDPOINT = 'progress';

export function createGetProgressHandler(
  scope: Construct,
  answersTable: ddb.ITable,
  progressTable: ddb.ITable,
  groupMembersTable: ddb.ITable,
  assetsBucket: s3.IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const method = 'GET';
  const getProgressHandler = new NodejsFunction(
    scope,
    'Get the current status of your game',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-progress.ts',
      handler: 'getProgress',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        PROGRESS_TABLE_NAME: progressTable.tableName,
        ANSWERS_TABLE_NAME: answersTable.tableName,
        GROUP_MEMBERS_TABLE_NAME: groupMembersTable.tableName,
        ASSETS_BUCKET_NAME: assetsBucket.bucketName,
      },
    }
  );

  getProgressHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  assetsBucket.grantRead(getProgressHandler);
  answersTable.grantReadData(getProgressHandler);
  progressTable.grantReadWriteData(getProgressHandler);
  groupMembersTable.grantReadData(getProgressHandler);

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateApiDocForMethod(
      scope,
      PROGRESS_API_ENDPOINT,
      method,
      apiHelper,
      { description: 'Posts a set of answers for a questionnaire' },
      { description: 'Game progress by category' }
    );
  }

  const validator = new RequestValidator(scope, 'FactoryGetProgressValidator', {
    requestValidatorName: `FactoryGetProgressValidator-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: false,
    validateRequestParameters: true,
  });

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    PROGRESS_API_ENDPOINT,
    getProgressHandler,
    { type: AuthType.JWT },
    {
      requestValidator: validator,
      requestParameters: {
        'method.request.querystring.organization_ids': true,
        'method.request.querystring.questionnaire_id': true,
        'method.request.querystring.user_id': true,
      },
      methodResponses: commonResponses(register, 'GetProgress'),
    }
  );

  // register to group admin API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${PROGRESS_API_ENDPOINT}`,
    getProgressHandler,
    { type: AuthType.COGNITO },
    {
      requestValidator: validator,
      requestParameters: {
        'method.request.querystring.organization_ids': true,
        'method.request.querystring.questionnaire_id': true,
      },
      methodResponses: commonResponses(register, 'GetProgress'),
    }
  );
}

export function createPostProgressHandler(
  scope: Construct,
  progressTable: ddb.ITable,
  answersTable: ddb.ITable,
  assetsBucket: s3.IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const method = 'POST';
  const postProgressHandler = new NodejsFunction(
    scope,
    'Approves a level as completed an unlocks the next level',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-progress.ts',
      handler: 'postProgress',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        PROGRESS_TABLE_NAME: progressTable.tableName,
        ANSWERS_TABLE_NAME: answersTable.tableName,
        ASSETS_BUCKET_NAME: assetsBucket.bucketName,
      },
    }
  );

  postProgressHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  progressTable.grantReadWriteData(postProgressHandler);

  //Grant permissions to dynamodb
  answersTable.grantReadWriteData(postProgressHandler);

  //Grant permissions to bucket
  assetsBucket.grantReadWrite(postProgressHandler);

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generatePostProgressAPIdocs(scope, PROGRESS_API_ENDPOINT, method, apiHelper);
  }

  const validator = new RequestValidator(
    scope,
    'FactoryPostProgressValidator',
    {
      requestValidatorName: `FactoryPostProgressValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: true,
      validateRequestParameters: false,
    }
  );

  // register to group admin API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${PROGRESS_API_ENDPOINT}`,
    postProgressHandler,
    { type: AuthType.COGNITO },
    {
      requestValidator: validator,
      requestModels: { 'application/json': register.getModel('PostProgress') },
      methodResponses: commonResponses(register),
    }
  );
}

function generatePostProgressAPIdocs(
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
      status: 'successful',
      code: 200,
      message: method + ' was succesful',
      description: 'Approve level and unluck the next level',
    }),
    restApiId: api.api.restApiId,
  });
}
