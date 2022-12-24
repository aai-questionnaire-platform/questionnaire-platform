import { MethodOptions } from '@aws-cdk/aws-apigateway';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';

const SERVICES_API_END_POINT = 'services';

export function createServicesHandler(
  scope: Construct,
  orderTable: ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  layers: LayerVersion[]
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
      ORDER_TABLE_NAME: orderTable.tableName,
    },
  });

  const method = 'GET';

  getServicesHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  orderTable.grantReadWriteData(getServicesHandler);

  const endPointParameters: MethodOptions = {
    methodResponses: commonResponses(register),
  };

  // register to API
  apiHelper.addMethodIntegration(
    method,
    SERVICES_API_END_POINT,
    getServicesHandler,
    { type: AuthType.JWT },
    endPointParameters
  );
}
