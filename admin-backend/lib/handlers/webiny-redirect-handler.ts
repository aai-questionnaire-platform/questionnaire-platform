import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ApiGatewayHelper } from '../helpers/api-gw-helper';
import { Construct, Duration } from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda';
import { Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { AuthorizationScopes, AuthType } from '../helpers/types';
import { GameInstance } from '../../src/datamodels/game-instance';

export function createWebinyRedirectHandlers(
  construct: Construct,
  api: ApiGatewayHelper,
  webinyToken: string,
  webinyEndpoint: string,
  factoryInstanceProperties: Array<GameInstance>,
  cognitoAdminRole: Role,
  adminUserPoolId: string
) {
  const redirectReadHandler = new NodejsFunction(
    construct,
    'ReadRedirectToWebinyAPI',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/webiny.ts',
      handler: 'redirectReadToWebiny',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      environment: {
        WEBINY_TOKEN: webinyToken,
        WEBINY_ENDPOINT: webinyEndpoint,
        GAME_INSTANCES: JSON.stringify(factoryInstanceProperties),
        ADMIN_USER_POOL: adminUserPoolId,
      },
      role: cognitoAdminRole,
      timeout: Duration.seconds(10),
    }
  );

  const redirectPreviewHandler = new NodejsFunction(
    construct,
    'PreviewRedirectToWebinyAPI',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/webiny.ts',
      handler: 'redirectPreviewToWebiny',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      environment: {
        WEBINY_TOKEN: webinyToken,
        WEBINY_ENDPOINT: webinyEndpoint,
        GAME_INSTANCES: JSON.stringify(factoryInstanceProperties),
        ADMIN_USER_POOL: adminUserPoolId,
      },
      role: cognitoAdminRole,
      timeout: Duration.seconds(10),
    }
  );

  const redirectManageHandler = new NodejsFunction(
    construct,
    'ManageRedirectToWebinyAPI',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/webiny.ts',
      handler: 'redirectManageToWebiny',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      environment: {
        WEBINY_TOKEN: webinyToken,
        WEBINY_ENDPOINT: webinyEndpoint,
        GAME_INSTANCES: JSON.stringify(factoryInstanceProperties),
        ADMIN_USER_POOL: adminUserPoolId,
      },
      role: cognitoAdminRole,
      timeout: Duration.seconds(300),
    }
  );

  redirectReadHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  redirectPreviewHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  redirectManageHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const method = 'POST';

  const webinyMethodResponses = {
    methodResponses: [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      },
    ],
  };

  api.addMethodIntegration(
    method,
    'read',
    redirectReadHandler,
    {
      type: AuthType.COGNITO,
      authorizationScopes: [`mmk-admin-rs/${AuthorizationScopes.ADMIN}`],
    },
    webinyMethodResponses
  );
  api.addMethodIntegration(
    method,
    'preview',
    redirectPreviewHandler,
    {
      type: AuthType.COGNITO,
      authorizationScopes: [`mmk-admin-rs/${AuthorizationScopes.ADMIN}`],
    },
    webinyMethodResponses
  );
  api.addMethodIntegration(
    method,
    'manage',
    redirectManageHandler,
    {
      type: AuthType.COGNITO,
      authorizationScopes: [`mmk-admin-rs/${AuthorizationScopes.ADMIN}`],
    },
    webinyMethodResponses
  );
}
