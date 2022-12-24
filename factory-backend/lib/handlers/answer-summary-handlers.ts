import {
  CfnDocumentationPart,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

export function createProcessAnswersHandler(
  scope: Construct,
  answersTable: ddb.ITable,
  summaryTable: ddb.ITable,
  assetsBucket: s3.IBucket,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const processInsertedAnswersHandler = new NodejsFunction(
    scope,
    'Process changed items in answers and update summary table',
    {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'src/handlers/process-answers.ts',
      handler: 'processAnswers',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ANSWERS_SUMMARY_TABLE_NAME: summaryTable.tableName,
        ASSETS_BUCKET_NAME: assetsBucket.bucketName,
      },
    }
  );

  processInsertedAnswersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to summary
  summaryTable.grantReadWriteData(processInsertedAnswersHandler);

  //Grant permissions to bucket
  assetsBucket.grantReadWrite(processInsertedAnswersHandler);

  //Add dynamodb event source
  processInsertedAnswersHandler.addEventSource(
    new DynamoEventSource(answersTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      retryAttempts: 10,
    })
  );
}

export function createGetAnswerSummaryHandler(
  scope: Construct,
  summaryTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  minNumberOfResponses: string,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const getAnswerSummaryHandler = new NodejsFunction(
    scope,
    'Get summary of answers given by group to a question category',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-answer-summary.ts',
      handler: 'getAnswerSummary',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ANSWERS_SUMMARY_TABLE_NAME: summaryTable.tableName,
        GROUP_ANSWER_COUNT_LIMIT: minNumberOfResponses,
      },
    }
  );

  getAnswerSummaryHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  summaryTable.grantReadWriteData(getAnswerSummaryHandler);

  //Specify method and path
  const method = 'GET';
  const path = 'answersummary';

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetAnswerSummaryAPIdocs(scope, path, method, apiHelper);
  }

  const validator = new RequestValidator(
    scope,
    'FactoryGetAnswerSummaryValidator',
    {
      requestValidatorName: `FactoryGetAnswerSummaryValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: false,
      validateRequestParameters: true,
    }
  );

  const endPointParameters = {
    requestValidator: validator,
    requestParameters: {
      'method.request.querystring.organization_ids': true,
      'method.request.querystring.questionnaire_id': true,
      'method.request.querystring.category_id': true,
    },
    methodResponses: commonResponses(register, 'GetAnswerSummary'),
  };

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    path,
    getAnswerSummaryHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${path}`,
    getAnswerSummaryHandler,
    { type: AuthType.COGNITO },
    endPointParameters
  );
}

function generateGetAnswerSummaryAPIdocs(
  scope: Construct,
  path: string,
  method: string,
  api: ApiGatewayHelper
) {
  new CfnDocumentationPart(scope, path + '-' + method + '-doc-method', {
    location: {
      type: 'METHOD',
      method: method,
      path: path,
    },
    properties: JSON.stringify({
      status: 'succesful',
      code: 200,
      message: method + ' was succesful',
      description: 'Get summary to responses by a group to a question category',
    }),
    restApiId: api.api.restApiId,
  });

  //Create method parameter documentation
  new CfnDocumentationPart(
    scope,
    path + '-' + method + 'category_id' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'category_id',
      },
      properties: JSON.stringify({ description: 'The question category id' }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(
    scope,
    path + '-' + method + 'organization_ids' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'organization_ids',
      },
      properties: JSON.stringify({
        description: 'Comma separated list of organization ids user belongs to',
      }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(
    scope,
    path + '-' + method + 'questionnaire_id' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'questionnaire_id',
      },
      properties: JSON.stringify({ description: 'Questionnaire identifier' }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(scope, path + '-' + method + '-doc-response-body', {
    location: {
      type: 'RESPONSE_BODY',
      method: method,
      path: path,
    },
    properties: JSON.stringify({
      description: 'A summary of answers by value',
    }),
    restApiId: api.api.restApiId,
  });
}
