import { MethodOptions } from '@aws-cdk/aws-apigateway';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { PolicyStatement, Policy } from '@aws-cdk/aws-iam';

import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { commonResponses } from './responses';

const CATEGORIES_API_END_POINT = 'categories';

export function createGetCategoriesHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[],
  environment: string
) {
  const getCategoriesHandler = new NodejsFunction(scope, 'List of categories', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/get-categories.ts',
    handler: 'getCategories',
    memorySize: 128,
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies'],
    },
    layers,
    environment: {
      JSON_BUCKET_NAME: `dashboardadminassets-${environment}`,
      CATEGORIES_FILE_NAME: `categories.json`,
      SERVICES_FILE_NAME: `services.json`,
    },
  });

  const bucketPolicyStatement = new PolicyStatement({
    actions: ['s3:List*', 's3:Get*'],
    resources: ['arn:aws:s3:::*'],
  });

  getCategoriesHandler.role?.attachInlinePolicy(
    new Policy(scope, 'use-s3-policy-categories', {
      statements: [bucketPolicyStatement],
    })
  );

  const method = 'GET';

  getCategoriesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    CATEGORIES_API_END_POINT,
    getCategoriesHandler,
    endPointParameters
  );
}

export function createPostCategoriesHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[],
  environment: string
) {
  const getCategoriesHandler = new NodejsFunction(scope, 'Update categories', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-categories.ts',
    handler: 'postCategories',
    memorySize: 128,
    bundling: {
      minify: true,
      externalModules: ['aws-sdk', 'dependencies'],
    },
    layers,
    environment: {
      JSON_BUCKET_NAME: `dashboardadminassets-${environment}`,
      CATEGORIES_FILE_NAME: `categories.json`,
      SERVICES_FILE_NAME: `services.json`,
    },
  });

  const bucketPolicy = new PolicyStatement({
    actions: ['s3:List*', 's3:Get*', 's3:Put*'],
    resources: ['arn:aws:s3:::*'],
  });

  getCategoriesHandler.role?.attachInlinePolicy(
    new Policy(scope, 'use-s3-edit-policy-categories', {
      statements: [bucketPolicy],
    })
  );

  const method = 'POST';

  getCategoriesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    CATEGORIES_API_END_POINT,
    getCategoriesHandler,
    endPointParameters
  );
}
