import * as ddb from '@aws-cdk/aws-dynamodb';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { EnvParams } from "../questionnaire-factory-backend";

export function createAttributeHandler(
  scope: Construct,
  envParams: EnvParams,
  answersTable: ddb.ITable,
  aaiAttributeTable: ddb.ITable,
  dependenciesLayer: lambda.LayerVersion,
  codeLayer: lambda.LayerVersion
) {
  const generateAttributesFromAnswersHandler = new NodejsFunction(
    scope,
    'Generate attribute',
    {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'src/handlers/process-answers.ts',
      handler: 'generateAttribute',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ATTRIBUTE_TABLE_NAME: aaiAttributeTable.tableName,
        AAI_ATTRIBUTES: envParams.AAI_ATTRIBUTES
      },
    }
  );

  generateAttributesFromAnswersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  // Grant permissions to attribute table
  aaiAttributeTable.grantReadWriteData(generateAttributesFromAnswersHandler);

  // Add dynamodb event source
  generateAttributesFromAnswersHandler.addEventSource(
    new DynamoEventSource(answersTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      retryAttempts: 10,
    })
  );
}

export function createAttributePointerHandler(
  scope: Construct,
  envParams: EnvParams,
  aaiAttributeTable: ddb.ITable,
  tokenTable: ddb.ITable,
  dependenciesLayer: lambda.LayerVersion,
  codeLayer: lambda.LayerVersion
) {
  const addAttributePointerHandler = new NodejsFunction(
    scope,
    'Add attribute pointer to AAI profile api',
    {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'src/handlers/add-attribute-pointer.ts',
      handler: 'addAttributePointer',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ATTRIBUTE_TABLE_NAME: aaiAttributeTable.tableName,
        TOKEN_TABLE_NAME: tokenTable.tableName,
        AAI_ATTRIBUTES: envParams.AAI_ATTRIBUTES,
        AAI_SERVICE_URL: envParams.AAI_SERVICE_URL,
        NEXTAUTH_PROVIDER: envParams.NEXTAUTH_PROVIDER
      },
    }
  );

  addAttributePointerHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  // Grant the needed permissions to tables
  tokenTable.grantReadData(addAttributePointerHandler);
  aaiAttributeTable.grantReadData(addAttributePointerHandler);

  // Add dynamodb event source
  addAttributePointerHandler.addEventSource(
    new DynamoEventSource(aaiAttributeTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      retryAttempts: 10,
    })
  );
}
