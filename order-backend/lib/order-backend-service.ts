import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

import { createServicesHandler } from './handlers/services-handler';
import { createCodeHandler } from './handlers/code-handler';
import { createOrderHandler } from './handlers/order-handler';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { ModelRegister } from './helpers/model-register';
import { EnvParams } from './order-backend-stack';
import { postTokenHandler } from './handlers/token-handler';
import { createWalletHandler } from './handlers/wallet-handler';
import { Secret } from '@aws-cdk/aws-secretsmanager';

export class OrderBackendService extends cdk.Construct {
  //Register of api gw models
  register = new ModelRegister();

  constructor(
    scope: cdk.Stack,
    id: string,
    apiHelper: ApiGatewayHelper,
    assetsBucketName: string,
    codeTableName: string,
    orderTableName: string,
    tokenTableName: string,
    walletTableName: string,
    envParams: EnvParams,
    layers: any
  ) {
    super(scope, id);

    //Register models
    this.register.registerModels(scope, apiHelper.api);

    //Import secrets
    const kelaApiKey = Secret.fromSecretNameV2(
      scope,
      `kela-api-secretkey-${envParams.ENV_NAME}`,
      'KELA_API_KEY',
    ).secretValue.toString();

    const kelaAdminApiKey = Secret.fromSecretNameV2(
      scope,
      `kela-admin-api-secretkey-${envParams.ENV_NAME}`,
      'X_KELA_API_KEY',
    ).secretValue.toString();

    //Create import for assets bucket
    const assetsBucket = s3.Bucket.fromBucketName(
      this,
      'imported-bucket-from-name',
      assetsBucketName
    );

    //Create import for code table
    const codeTable = ddb.Table.fromTableName(
      this,
      'imported-code-table-from-name',
      codeTableName
    );

    //Create import for order table
    const orderTable = ddb.Table.fromTableName(
      this,
      'imported-order-table-from-name',
      orderTableName
    );

    //Create import for token table
    const tokenTable = ddb.Table.fromTableName(
      this,
      'imported-token-table-from-name',
      tokenTableName
    );

    //Create import for wallet table
    const walletTable = ddb.Table.fromTableName(
      this,
      'imported-wallet-table-from-name',
      walletTableName
    );

    //Create request handlers
    //GET /services
    createServicesHandler(this, orderTable, apiHelper, this.register, [
      layers.dependencyLayer,
      layers.codeLayer,
    ]);

    //POST /code
    createCodeHandler(
      this,
      codeTable,
      orderTable,
      walletTable,
      apiHelper,
      this.register,
      kelaApiKey,
      kelaAdminApiKey,
      [layers.dependencyLayer, layers.codeLayer]
    );

    //POST /order
    createOrderHandler(
      this,
      orderTable,
      walletTable,
      apiHelper,
      this.register,
      kelaApiKey,
      kelaAdminApiKey,
      [layers.dependencyLayer, layers.codeLayer],
      assetsBucket
    );

    require('dotenv').config();
    //POST /token
    postTokenHandler(
      this,
      tokenTable,
      apiHelper,
      this.register,
      [layers.dependencyLayer, layers.codeLayer],
      <string>process.env.AAI_CLIENTID,
      <string>process.env.AAI_CLIENTSECRET,
      <string>process.env.AAI_LOGIN_REDIRECT_URL,
      <string>process.env.AAI_LOGIN_URL
    );

    //GET /wallet
    createWalletHandler(
      this,
      walletTable,
      apiHelper,
      this.register,
      [
        layers.dependencyLayer,
        layers.codeLayer,
      ]);

    apiHelper.deployToStage(scope, envParams.ENV_NAME);
  }
}
