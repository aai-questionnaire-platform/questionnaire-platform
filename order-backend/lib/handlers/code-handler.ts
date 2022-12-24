import { MethodOptions } from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct, Duration } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';

const CODE_API_END_POINT = 'code';

export function createCodeHandler(
  scope: Construct,
  codeTable: ddb.ITable,
  orderTable: ddb.ITable,
  walletTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  kelaApiKey: string,
  kelaAdminApiKey: string,
  layers: LayerVersion[]
) {
  const postCodeOrderHandler = new NodejsFunction(
    scope,
    'Code to access service',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-code-order.ts',
      handler: 'postCodeOrder',
      memorySize: 128,
      timeout: Duration.seconds(60),
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers,
      environment: {
        CODE_TABLE_NAME: codeTable.tableName,
        ORDER_TABLE_NAME: orderTable.tableName,
        WALLET_TABLE_NAME: walletTable.tableName,
        X_API_KEY: kelaApiKey,
        ADMIN_X_API_KEY: kelaAdminApiKey,
      },
    }
  );

  const method = 'POST';

  postCodeOrderHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  codeTable.grantReadWriteData(postCodeOrderHandler);
  orderTable.grantReadWriteData(postCodeOrderHandler);
  walletTable.grantReadWriteData(postCodeOrderHandler);

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    CODE_API_END_POINT,
    postCodeOrderHandler,
    { type: AuthType.JWT },
    endPointParameters
  );
}
