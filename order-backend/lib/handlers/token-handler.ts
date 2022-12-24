import { MethodOptions } from '@aws-cdk/aws-apigateway';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct, Duration } from '@aws-cdk/core';


import { ApiGatewayHelper } from '../helpers/apigw-helper';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';

const TOKEN_API_END_POINT = 'token';

export function postTokenHandler(
  scope: Construct,
  tokenTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[],
  clientId: string,
  clientSecret: string,
  aaiLoginRedirectUrl: string,
  aaiLoginUrl: string
) {
  const postTokenHandler = new NodejsFunction(scope, 'Submit token to be used in OAuth2-authentication', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-token.ts',
    handler: 'postToken',
    memorySize: 128,
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies'],
    },
    layers,
    environment: {
      TOKEN_TABLE_NAME: tokenTable.tableName,
      AAI_CLIENTID: clientId,
      AAI_CLIENTSECRET: clientSecret,
      AAI_LOGIN_REDIRECT_URL: aaiLoginRedirectUrl,
      AAI_LOGIN_URL: aaiLoginUrl,
    },
    timeout: Duration.seconds(10)
  });

  const method = 'POST';

  postTokenHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register, undefined),
  };

  tokenTable.grantReadWriteData(postTokenHandler);

  // register to API
  apiHelper.addMethodIntegration(
    method,
    TOKEN_API_END_POINT,
    postTokenHandler,
    { type: AuthType.NONE },
    endPointParameters
  );
}
