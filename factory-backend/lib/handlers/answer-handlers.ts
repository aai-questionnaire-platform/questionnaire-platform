import {
  CfnDocumentationPart,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { IBucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

const ANSWERS_API_ENDPOINT = 'answers';
const VALIDATE_API_ENDPOINT = `${ANSWERS_API_ENDPOINT}/validate`;

export function createPostAnswersHandler(
  scope: Construct,
  answersTable: ITable,
  assetsBucket: IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const createAnswersHandler = new NodejsFunction(scope, 'PostAnswersHandler', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-answers.ts',
    handler: 'postAnswers',
    memorySize: 128,
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies', 'aws-cdk'],
    },
    layers,
    environment: {
      ANSWERS_TABLE_NAME: answersTable.tableName,
      ASSETS_BUCKET_NAME: assetsBucket.bucketName,
    },
  });

  createAnswersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to bucket
  assetsBucket.grantReadWrite(createAnswersHandler);

  //Grant permissions to dynamodb
  answersTable.grantReadWriteData(createAnswersHandler);

  //Specify method and path
  const method = 'POST';

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generatePostAnswersAPIdocs(scope, ANSWERS_API_ENDPOINT, method, apiHelper);
  }

  const validator = new RequestValidator(scope, 'FactoryPostAnswersValidator', {
    requestValidatorName: `FactoryPostAnswersValidator-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: true,
    validateRequestParameters: false,
  });

  //Register to API
  apiHelper.addMethodIntegration(
    method,
    ANSWERS_API_ENDPOINT,
    createAnswersHandler,
    { type: AuthType.JWT },
    {
      requestValidator: validator,
      requestModels: { 'application/json': register.getModel('PostAnswers') },
      methodResponses: commonResponses(register),
    }
  );
}

export function createGetAnswersHandler(
  scope: Construct,
  answersTable: ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const getAnswersHandler = new NodejsFunction(scope, 'GetAnswersHandler', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/get-answers.ts',
    handler: 'getAnswers',
    memorySize: 128,
    bundling: {
      minify: true,
    },
    layers,
    environment: {
      ANSWERS_TABLE_NAME: answersTable.tableName,
    },
  });

  getAnswersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  answersTable.grantReadWriteData(getAnswersHandler);

  //Specify method and path
  const method = 'GET';

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetAnswersAPIdocs(scope, ANSWERS_API_ENDPOINT, method, apiHelper);
  }

  const validator = new RequestValidator(scope, 'FactoryGetAnswersValidator', {
    requestValidatorName: `FactoryGetAnswersValidator-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: false,
    validateRequestParameters: true,
  });

  apiHelper.addMethodIntegration(
    method,
    ANSWERS_API_ENDPOINT,
    getAnswersHandler,
    { type: AuthType.JWT },
    {
      requestValidator: validator,
      requestParameters: {
        'method.request.querystring.organization_ids': true,
        'method.request.querystring.questionnaire_id': true,
      },
      methodResponses: commonResponses(register, 'GetAnswers'),
    }
  );
}

export function createValidateAnswersHandler(
  construct: Construct,
  assetsBucket: IBucket,
  api: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[]
) {
  const method = 'POST';
  const postValidateAnswersHandler = new NodejsFunction(
    construct,
    'PostValidateAnswersHandler',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-answers.ts',
      handler: 'validateAnswerSet',
      memorySize: 128,
      bundling: { minify: true },
      layers,
      environment: {
        ASSETS_BUCKET_NAME: assetsBucket.bucketName,
      },
    }
  );

  postValidateAnswersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  assetsBucket.grantRead(postValidateAnswersHandler);

  const endPointParameters = { methodResponses: commonResponses(register) };

  api.addMethodIntegration(
    method,
    VALIDATE_API_ENDPOINT,
    postValidateAnswersHandler,
    { type: AuthType.NONE },
    endPointParameters
  );
}

function generateGetAnswersAPIdocs(
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
      description: 'Get answers to a questionnaire by key',
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
        name: 'user_id',
      },
      properties: JSON.stringify({ description: 'The user id' }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(
    construct,
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
    construct,
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
  new CfnDocumentationPart(
    construct,
    path + '-' + method + '-doc-response-body',
    {
      location: {
        type: 'RESPONSE_BODY',
        method: method,
        path: path,
      },
      properties: JSON.stringify({ description: 'List of answers' }),
      restApiId: api.api.restApiId,
    }
  );
}

function generatePostAnswersAPIdocs(
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
      description: 'Posts a set of answers for a questionnaire',
    }),
    restApiId: api.api.restApiId,
  });

  //Create method parameter documentation
  new CfnDocumentationPart(construct, path + '-' + method + '-doc-body', {
    location: {
      type: 'REQUEST_BODY',
      method: method,
      path: path,
    },
    properties: JSON.stringify({ description: 'List of answers' }),
    restApiId: api.api.restApiId,
  });
}
