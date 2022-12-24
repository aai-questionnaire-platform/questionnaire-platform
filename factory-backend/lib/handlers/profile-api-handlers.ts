import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ISecret } from '@aws-cdk/aws-secretsmanager';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import {generateApiDocForMethod} from "./generate-docs";

const PATH_PREFIX = 'auroraai/profile-management/v1/';
const USER_ATTRIBUTES_ENDPOINT = 'user_attributes';

export function createGetUserAttributesHandler(
  scope: Construct,
  aaiAttributesTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const method = 'GET';
  const getUserAttributesHandler = new NodejsFunction(
    scope,
    'Get AAI attributes of a user',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/profile-api/get-user-attributes.ts',
      handler: 'getUserAttributes',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ATTRIBUTE_TABLE_NAME: aaiAttributesTable.tableName,
      },
    }
  );

  getUserAttributesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  aaiAttributesTable.grantReadData(getUserAttributesHandler);

 apiHelper.addProfileApiMethodIntegration(
   method,
   PATH_PREFIX + USER_ATTRIBUTES_ENDPOINT,
   getUserAttributesHandler,
   { type: AuthType.PROFILEAPI_JWT }
 );
}

export function createDeleteUserAttributesHandler(
  scope: Construct,
  aaiAttributesTable: ddb.ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const method = 'DELETE';
  const deleteUserAttributesHandler = new NodejsFunction(
    scope,
    'Delete AAI attributes of a user',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/profile-api/delete-user-attributes.ts',
      handler: 'deleteUserAttributes',
      memorySize: 128,
      bundling: {
        minify: true,
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ATTRIBUTE_TABLE_NAME: aaiAttributesTable.tableName,
      },
    }
  );

  deleteUserAttributesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  aaiAttributesTable.grantReadWriteData(deleteUserAttributesHandler);

  apiHelper.addProfileApiMethodIntegration(
    method,
    PATH_PREFIX + USER_ATTRIBUTES_ENDPOINT,
    deleteUserAttributesHandler,
    { type: AuthType.PROFILEAPI_JWT }
  )
}
