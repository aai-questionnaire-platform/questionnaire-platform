import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ISecret } from '@aws-cdk/aws-secretsmanager';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { generateApiDocForMethod } from './generate-docs';
import { EnvParams } from '../questionnaire-factory-backend';

const USER_SETTINGS_API_ENDPOINT = 'settings';

export function createGetUserSettingsHandler(
  scope: Construct,
  userSettingsTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion,
  apiKeySecret: ISecret
) {
  const method = 'GET';
  const getUserSettingsHandler = new NodejsFunction(
    scope,
    'Get user settings by user id',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-user-settings.ts',
      handler: 'getUserSettings',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        USER_SETTINGS_TABLE_NAME: userSettingsTable.tableName,
      },
    }
  );

  getUserSettingsHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  apiKeySecret.grantRead(getUserSettingsHandler);

  userSettingsTable.grantReadData(getUserSettingsHandler);

  if (envParams.GENERATEAPIDOC === 'true') {
    generateApiDocForMethod(
      scope,
      USER_SETTINGS_API_ENDPOINT,
      method,
      apiHelper,
      {
        description: 'User settings if found',
      }
    );
  }

  apiHelper.addMethodIntegration(
    method,
    USER_SETTINGS_API_ENDPOINT,
    getUserSettingsHandler,
    {
      type: AuthType.JWT
    },
    { methodResponses: commonResponses(register) }
  );
}

export function createPostUserSettingsHandler(
  construct: Construct,
  userSettingsTable: ddb.ITable,
  api: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const method = 'POST';
  const postUserSettingsHandler = new NodejsFunction(
    construct,
    'Save user settings',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-user-settings.ts',
      handler: 'postUserSettings',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        USER_SETTINGS_TABLE_NAME: userSettingsTable.tableName,
      },
    }
  );

  postUserSettingsHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  userSettingsTable.grantReadWriteData(postUserSettingsHandler);

  if (envParams.GENERATEAPIDOC) {
    generateApiDocForMethod(
      construct,
      USER_SETTINGS_API_ENDPOINT,
      method,
      api,
      undefined,
      undefined,
      {
        description: 'User settings',
      }
    );
  }

  const endPointParameters = { methodResponses: commonResponses(register) };

  api.addMethodIntegration(
    method,
    USER_SETTINGS_API_ENDPOINT,
    postUserSettingsHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to admin api
  api.addMethodIntegration(
    method,
    `admin/${USER_SETTINGS_API_ENDPOINT}`,
    postUserSettingsHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}
