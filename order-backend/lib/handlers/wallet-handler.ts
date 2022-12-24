import { MethodOptions } from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';

const WALLET_API_END_POINT = 'wallet';

export function createWalletHandler(
  scope: Construct,
  walletTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[]
) {
  const getWalletHandler = new NodejsFunction(
    scope,
    'KELA Wallet for ordering services',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-wallet.ts',
      handler: 'getWallet',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers,
      environment: {
        WALLET_TABLE_NAME: walletTable.tableName,
      },
    }
  );

  const method = 'GET';

  getWalletHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to dynamodb
  walletTable.grantReadWriteData(getWalletHandler);

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    WALLET_API_END_POINT,
    getWalletHandler,
    { type: AuthType.JWT },
    endPointParameters
  );
}
