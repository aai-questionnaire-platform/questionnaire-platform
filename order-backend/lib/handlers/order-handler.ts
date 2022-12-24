import { MethodOptions, RequestValidator } from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct, Duration } from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';

const ORDER_API_END_POINT = 'order';

export function createOrderHandler(
  scope: Construct,
  orderTable: ddb.ITable,
  walletTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  kelaApiKey: string,
  kelaAdminApiKey: string,
  layers: LayerVersion[],
  assetsBucket: s3.IBucket
) {
  const postOrderHandler = new NodejsFunction(scope, 'OrderPostOrderHandler', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-order.ts',
    handler: 'postOrder',
    memorySize: 128,
    timeout: Duration.seconds(60),
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies'],
    },
    layers,
    environment: {
      ORDER_TABLE_NAME: orderTable.tableName,
      WALLET_TABLE_NAME: walletTable.tableName,
      ORDER_SENDER_ADDRESS: 'email@example.com',
      SERVICE_PROVIDERS_BUCKET_NAME: assetsBucket.bucketName,
      X_API_KEY: kelaApiKey,
      ADMIN_X_API_KEY: kelaAdminApiKey,
    },
  });

  const method = 'POST';

  postOrderHandler.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    })
  );

  postOrderHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  orderTable.grantReadWriteData(postOrderHandler);
  walletTable.grantReadWriteData(postOrderHandler);

  //Grant read permission to s3 bucket
  assetsBucket.grantRead(postOrderHandler);

  const validator = new RequestValidator(scope, 'OrderPostOrderValidator', {
    requestValidatorName: 'OrderPostOrderValidator',
    restApi: apiHelper.api,
    validateRequestBody: true,
    validateRequestParameters: false,
  });

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: { 'application/json': register.getModel('PostOrderBody') },
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    ORDER_API_END_POINT,
    postOrderHandler,
    { type: AuthType.JWT },
    endPointParameters
  );
}
