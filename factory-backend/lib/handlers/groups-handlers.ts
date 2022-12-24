import {
  CfnDocumentationPart,
  MethodOptions,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

const GROUPS_API_END_POINT = 'groups';

export function createGetGroupsHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  groupsTable: ddb.ITable,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const getGroupsHandler = new NodejsFunction(
    scope,
    'Active groups by organization',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-groups.ts',
      handler: 'getGroups',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers,
      environment: {
        GROUPS_TABLE_NAME: groupsTable.tableName,
      },
    }
  );

  const method = 'GET';

  getGroupsHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  groupsTable.grantReadData(getGroupsHandler);

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetGroupsAPIdocs(scope, GROUPS_API_END_POINT, method, apiHelper);
  }

  const validator = new RequestValidator(scope, 'FactoryGetGroupsValidator', {
    requestValidatorName: `FactoryGetGroupsValidator-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: false,
    validateRequestParameters: true,
  });

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestParameters: {
      'method.request.querystring.parent_organization_id': false,
      'method.request.querystring.pin': false,
    },
    methodResponses: commonResponses(register, 'GetGroups'),
  };

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    GROUPS_API_END_POINT,
    getGroupsHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to group admin API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${GROUPS_API_END_POINT}`,
    getGroupsHandler,
    { type: AuthType.COGNITO },
    endPointParameters
  );

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${GROUPS_API_END_POINT}`,
    getGroupsHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}

function generateGetGroupsAPIdocs(
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
      description: 'Active groups for given organization',
    }),
    restApiId: api.api.restApiId,
  });

  //Create method parameter documentation
  new CfnDocumentationPart(
    construct,
    path + '-' + method + 'parent_organization_id' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'parent_organization_id',
      },
      properties: JSON.stringify({ description: 'Parent organization id' }),
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
    properties: JSON.stringify({ description: 'List of active groups' }),
    restApiId: api.api.restApiId,
  });
}

export function createPostNewGroupHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  groupsTable: ddb.ITable,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const postGroupHandler = new NodejsFunction(scope, 'Create a new group', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-group.ts',
    handler: 'postGroup',
    memorySize: 128,
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies'],
    },
    layers,
    environment: {
      GROUPS_TABLE_NAME: groupsTable.tableName,
    },
  });

  const method = 'POST';

  postGroupHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  groupsTable.grantReadWriteData(postGroupHandler);

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generatePostGroupAPIdocs(scope, GROUPS_API_END_POINT, method, apiHelper);
  }

  const validator = new RequestValidator(scope, 'FactoryPostGroupsValidator', {
    requestValidatorName: `FactoryPostGroupsValidatory-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: true,
    validateRequestParameters: false,
  });

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: { 'application/json': register.getModel('PostGroups') },
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    GROUPS_API_END_POINT,
    postGroupHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${GROUPS_API_END_POINT}`,
    postGroupHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}

function generatePostGroupAPIdocs(
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
      description: 'Creates a new group for given organization',
    }),
    restApiId: api.api.restApiId,
  });
}

export function createPutGroupHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  groupsTable: ddb.ITable,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const putGroupHandler = new NodejsFunction(
    scope,
    'Update an existing group',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/put-group.ts',
      handler: 'putGroup',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers,
      environment: {
        GROUPS_TABLE_NAME: groupsTable.tableName,
      },
    }
  );

  const method = 'PUT';

  putGroupHandler.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

  //Grant permissions to dynamodb
  groupsTable.grantReadWriteData(putGroupHandler);

  const validator = new RequestValidator(scope, 'FactoryPutGroupsValidator', {
    requestValidatorName: `FactoryPutGroupsValidator-${envParams.ENV_NAME}`,
    restApi: apiHelper.api,
    validateRequestBody: true,
    validateRequestParameters: false,
  });

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: { 'application/json': register.getModel('PostGroups') },
    methodResponses: commonResponses(register),
  };

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${GROUPS_API_END_POINT}`,
    putGroupHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}
