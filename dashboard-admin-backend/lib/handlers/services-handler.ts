import { MethodOptions } from '@aws-cdk/aws-apigateway';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { PolicyStatement, Policy } from '@aws-cdk/aws-iam';

import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { commonResponses } from './responses';

const SERVICES_API_END_POINT = 'services';

export function createGetServicesHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[],
  environment: string
) {
  const getServicesHandler = new NodejsFunction(scope, 'List of services', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/get-services.ts',
    handler: 'getServices',
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

  const s3BucketPolicy = new Policy(scope, 'use-s3-policy-services', {
    statements: [bucketPolicyStatement],
  });

  getServicesHandler.role?.attachInlinePolicy(s3BucketPolicy);

  const method = 'GET';

  getServicesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    SERVICES_API_END_POINT,
    getServicesHandler,
    endPointParameters
  );
}

export function createPostServicesHandler(
  scope: Construct,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[],
  environment: string
) {
  const getServicesHandler = new NodejsFunction(scope, 'Update services', {
    runtime: Runtime.NODEJS_14_X,
    entry: 'src/handlers/post-services.ts',
    handler: 'postServices',
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

  getServicesHandler.role?.attachInlinePolicy(
    new Policy(scope, 'use-s3-edit-policy-services', {
      statements: [bucketPolicy],
    })
  );

  const method = 'POST';

  getServicesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    SERVICES_API_END_POINT,
    getServicesHandler,
    endPointParameters
  );
}
