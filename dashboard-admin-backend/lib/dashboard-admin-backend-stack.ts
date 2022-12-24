import * as cdk from '@aws-cdk/core';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { DashboardAdminBackendService } from './dashboard-admin-backend-service';

export class DashboardAdminBackendStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    env: string,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);
    require('dotenv').config();

    const envParams: EnvParams = {
      ENV_NAME: env,
    };

    const depLayer = new LayerVersion(this, 'dashboardAdminDependenciesLayer', {
      code: Code.fromAsset('./src/node_modules/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'External modules layer',
    });

    const codeLayer = new LayerVersion(this, 'dashboardAdminCodeLayer', {
      code: Code.fromAsset('./src/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'Code layer layer',
    });

    const layers = { dependencyLayer: depLayer, codeLayer: codeLayer };

    //Import assets bucket name
    const ASSETS_BUCKET_NAME = cdk.Fn.importValue(
      `DashboardAdminAssets-${env}-Bucket-Name`
    );

    const apiGw = new ApiGatewayHelper(
      this,
      env,
      envParams,
      'DashboardAdminRestApiId-' + env,
      'DashboardAdminRestApiRootResource-' + env,
      'dashboard-admin-authorizer-' + env,
      layers
    );

    //Create the service and pass along the stack helper
    //Instantiate service
    new DashboardAdminBackendService(
      this,
      'DashboardAdminBackendService',
      apiGw,
      ASSETS_BUCKET_NAME,
      envParams,
      layers
    );
  }
}

export interface EnvParams {
  ENV_NAME: string;
}
