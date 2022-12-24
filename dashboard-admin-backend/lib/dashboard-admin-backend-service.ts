import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

import {
  createGetServicesHandler,
  createPostServicesHandler,
} from './handlers/services-handler';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { ModelRegister } from './helpers/model-register';
import { EnvParams } from './dashboard-admin-backend-stack';
import {
  createGetCategoriesHandler,
  createPostCategoriesHandler,
} from './handlers/categories-handler';

export class DashboardAdminBackendService extends cdk.Construct {
  //Register of api gw models
  register = new ModelRegister();

  constructor(
    scope: cdk.Stack,
    id: string,
    apiHelper: ApiGatewayHelper,
    assetsBucketName: string,
    envParams: EnvParams,
    layers: any
  ) {
    super(scope, id);

    //Register models
    this.register.registerModels(scope, apiHelper.api);

    //Create import for assets bucket
    const assetsBucket = s3.Bucket.fromBucketName(
      this,
      'imported-bucket-from-name',
      assetsBucketName
    );

    //Create request handlers
    //GET /services
    createGetServicesHandler(
      this,
      apiHelper,
      this.register,
      [layers.dependencyLayer, layers.codeLayer],
      envParams.ENV_NAME
    );

    //POST /services
    createPostServicesHandler(
      this,
      apiHelper,
      this.register,
      [layers.dependencyLayer, layers.codeLayer],
      envParams.ENV_NAME
    );

    // GET /categories
    createGetCategoriesHandler(
      this,
      apiHelper,
      this.register,
      [layers.dependencyLayer, layers.codeLayer],
      envParams.ENV_NAME
    );

    // POST /categories
    createPostCategoriesHandler(
      this,
      apiHelper,
      this.register,
      [layers.dependencyLayer, layers.codeLayer],
      envParams.ENV_NAME
    );

    apiHelper.deployToStage(scope, envParams.ENV_NAME);
  }
}
