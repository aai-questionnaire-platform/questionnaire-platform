import { MethodOptions, RequestValidator } from '@aws-cdk/aws-apigateway';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/api-gw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthorizationScopes, AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { GameInstance } from '../../src/datamodels/game-instance';

const USERS_END_POINT = 'users';

export function createGetUsersHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  cognitoAdminRole: Role,
  adminUserPoolId: string,
  layers: LayerVersion[],
  factoryInstanceProperties: Array<GameInstance>
) {
  const method = 'GET';
  const getUsersHandler = new NodejsFunction(
    scope,
    'Read users by organizationId',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-users.ts',
      handler: 'getUsers',
      memorySize: 128,
      bundling: { minify: true, externalModules: ['aws-sdk', 'dependencies'] },
      layers,
      environment: {
        GAME_INSTANCES: JSON.stringify(factoryInstanceProperties),
        ADMIN_USER_POOL: adminUserPoolId,
      },
      role: cognitoAdminRole,
    }
  );

  getUsersHandler.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

  const validator = new RequestValidator(scope, 'GetUsersValidator', {
    requestValidatorName: 'GetUsersValidator',
    restApi: apiHelper.api,
    validateRequestBody: false,
    validateRequestParameters: true,
  });

  // register to api
  apiHelper.addMethodIntegration(
    method,
    USERS_END_POINT,
    getUsersHandler,
    {
      type: AuthType.COGNITO,
      authorizationScopes: [`mmk-admin-rs/${AuthorizationScopes.ADMIN}`],
    },
    {
      requestValidator: validator,
      requestParameters: { 'method.request.querystring.organizationId': true },
    }
  );
}

export function createPostUserHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  cognitoAdminRole: Role,
  adminUserPoolId: string,
  register: ModelRegister,
  layers: LayerVersion[],
  factoryInstanceProperties: Array<GameInstance>
) {
  const method = 'POST';
  const postUserHandler = new NodejsFunction(
    scope,
    'Add user and join it to organization',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-user.ts',
      handler: 'postUser',
      memorySize: 128,
      bundling: { minify: true },
      layers,
      environment: {
        GAME_INSTANCES: JSON.stringify(factoryInstanceProperties),
        ADMIN_USER_POOL: adminUserPoolId,
      },
      role: cognitoAdminRole,
    }
  );

  postUserHandler.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));
  const validator = new RequestValidator(scope, 'PostUserValidator', {
    requestValidatorName: 'PostUserValidator',
    restApi: apiHelper.api,
    validateRequestBody: true,
    validateRequestParameters: false,
  });

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: { 'application/json': register.getModel('PostUser') },
    methodResponses: commonResponses(register),
  };

  // register to api
  apiHelper.addMethodIntegration(
    method,
    USERS_END_POINT,
    postUserHandler,
    {
      type: AuthType.COGNITO,
      authorizationScopes: [`mmk-admin-rs/${AuthorizationScopes.ADMIN}`],
    },
    endPointParameters
  );
}
