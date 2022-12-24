import * as cdk from '@aws-cdk/core';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { OrderBackendService } from './order-backend-service';

export class OrderBackendStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    env: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    require('dotenv').config();

    const envParams: EnvParams = {
      JWT_ISSUER: `${process.env.AAI_LOGIN_URL}/oauth`,
      JWT_AUDIENCE: <string>process.env.AAI_CLIENTID,
      ENV_NAME: env,
      AAI_ATTRIBUTES: 'order_app', //?
    };

    const depLayer = new LayerVersion(this, 'orderDependenciesLayer', {
      code: Code.fromAsset('./src/node_modules/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'External modules layer',
    });

    const codeLayer = new LayerVersion(this, 'orderCodeLayer', {
      code: Code.fromAsset('./src/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'Code layer layer',
    });

    const layers = { dependencyLayer: depLayer, codeLayer: codeLayer };

    //Import assets bucket name
    const ASSETS_BUCKET_NAME = cdk.Fn.importValue(
      `OrderAssets-${env}-Bucket-Name`
    );

    const CODE_TABLE_NAME = cdk.Fn.importValue(`CodeTable-${env}-Name`);
    const ORDER_TABLE_NAME = cdk.Fn.importValue(`OrderTable-${env}-Name`);
    const TOKEN_TABLE_NAME = cdk.Fn.importValue(`TokenTable-${env}-Name`);
    const WALLET_TABLE_NAME = cdk.Fn.importValue(`WalletTable-${env}-Name`);

    const apiGw = new ApiGatewayHelper(
      this,
      env,
      envParams,
      'OrderRestApiId-' + env,
      'OrderRestApiRootResource-' + env,
      'OrderCognitoAuthorizer-' + env,
      layers
    );

    //Create the service and pass along the stack helper
    //Instantiate service
    new OrderBackendService(
      this,
      'OrderBackendService',
      apiGw,
      ASSETS_BUCKET_NAME,
      CODE_TABLE_NAME,
      ORDER_TABLE_NAME,
      TOKEN_TABLE_NAME,
      WALLET_TABLE_NAME,
      envParams,
      layers
    );
  }
}

export interface EnvParams {
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  ENV_NAME: string;
  AAI_ATTRIBUTES: string;
}
