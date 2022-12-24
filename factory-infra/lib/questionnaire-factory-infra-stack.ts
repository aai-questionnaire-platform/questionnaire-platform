//vpc-stack.ts
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { StreamViewType } from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import { Runtime } from '@aws-cdk/aws-lambda';
import {
  CfnOutput,
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import { ApiGatewayHelper } from './apigw-helper';
import { SecretsHelper } from './secrets-helper';
import { CognitoHelper } from './cognito-helper';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

export class QuestionnaireFactoryInfraStack extends Stack {
  constructor(scope: Construct, envName: string, props?: StackProps) {
    const id = `QuestionnaireFactoryInfraStack-${envName}`;

    super(scope, id, props);

    const envParamMap = new Map<string, EnvParams>();
    envParamMap.set('dev', {
      appUrl: `https://${envName}.kyselypeli.fi`,
      appName: `${envName}`,
      appHumanReadableName: 'Dev env',
      aRecordName: `factory-${envName}`,
      profileApiHostname: `dev-api-${envName}.kyselypeli.fi`,
      profileApiCert:
        '[REMOVED]',
      groupAdminCallBackUrl: 'api/auth/callback/admin-dev',
      zoneName: 'kyselypeli.fi',
      hostedZoneId: 'REMOVED',
      publicCertRef:
        '[REMOVED]',
      verifiedDomainArn:
        '[REMOVED]',
    });

    const envParams = envParamMap.has(envName)
      ? envParamMap.get(envName)!
      : envParamMap.get('muntesti-dev')!;

    const answersTableName = 'FactoryAnswersTable-' + envName;
    const answersSummaryTableName = 'FactoryAnswersSummaryTable-' + envName;
    const progressTableName = 'FactoryProgressTable-' + envName;
    const groupsTableName = 'FactoryGroupsTable-' + envName;
    const groupMembersTableName = 'FactoryGroupMembersTable-' + envName;
    const userSettingsTableName = 'FactoryUserSettingsTable-' + envName;
    const s3BucketName = 'FactoryAssets-' + envName;
    const aaiAttributeTableName = 'FactoryAaiAttributeTable-' + envName;
    const tokensTableName = 'FactoryAaiTokensTable-' + envName;

    const s3bucket = new s3.Bucket(this, s3BucketName, {
      versioned: true,
    });

    const answersTable = new dynamodb.Table(this, answersTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      sortKey: { name: 'answer_id', type: dynamodb.AttributeType.STRING },
      partitionKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    const answersSummaryTable = new dynamodb.Table(
      this,
      answersSummaryTableName,
      {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
        sortKey: { name: 'org_id', type: dynamodb.AttributeType.STRING },
        partitionKey: { name: 'cat_id', type: dynamodb.AttributeType.STRING },
      }
    );

    const aaiAttributeTable = new dynamodb.Table(this, aaiAttributeTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      sortKey: { name: 'attribute_name', type: dynamodb.AttributeType.STRING },
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      stream: StreamViewType.NEW_IMAGE,
    });

    const tokensTable = new dynamodb.Table(this, tokensTableName, {
      tableName: tokensTableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'expires_at',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    tokensTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    const progressTable = new dynamodb.Table(this, progressTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      sortKey: {
        name: 'questionnaire_id',
        type: dynamodb.AttributeType.STRING,
      },
      partitionKey: { name: 'org_id', type: dynamodb.AttributeType.STRING },
    });

    const groupsTable = new dynamodb.Table(this, groupsTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: {
        name: 'parent_organization_id',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'organization_id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const groupMembersTable = new dynamodb.Table(this, groupMembersTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
    });

    const userSettingsTable = new dynamodb.Table(this, userSettingsTableName, {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: {
        name: 'user_id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    groupsTable.addLocalSecondaryIndex({
      indexName: 'valid-until-index',
      sortKey: { name: 'valid_until', type: dynamodb.AttributeType.STRING },
    });

    groupsTable.addLocalSecondaryIndex({
      indexName: 'organization_name-index',
      sortKey: {
        name: 'organization_name',
        type: dynamodb.AttributeType.STRING,
      },
    });

    groupsTable.addGlobalSecondaryIndex({
      indexName: 'pin-code-index',
      partitionKey: {
        name: 'pin',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const tokenGenerator = new NodejsFunction(
      this,
      'cognito-pre-token-generator',
      {
        runtime: Runtime.NODEJS_14_X,
        entry: 'src/handlers/pre-token-generator.ts',
        handler: 'preTokenGenerator',
        memorySize: 128,
        bundling: {
          minify: true,
          externalModules: ['aws-sdk', 'dependencies'],
        },
      }
    );

    const customMessageHandler = new NodejsFunction(
      this,
      'cognito-custom-message-handler',
      {
        runtime: Runtime.NODEJS_14_X,
        entry: 'src/handlers/custom-message.ts',
        handler: 'customMessageHandler',
        memorySize: 128,
        environment: {
          loginLink: envParams.appUrl,
          supportMailAddress: 'address@example.com',
          appName: envParams.appHumanReadableName,
        },
        bundling: {
          minify: true,
          externalModules: ['aws-sdk', 'dependencies'],
        },
      }
    );

    // API key is created outside the stack
    const apiKeySecret = new SecretsHelper().getApiKey(this, envName);

    //Create user pool authorizer
    const cognitoHelper = new CognitoHelper(
      this,
      'cognito-authorizer',
      envName,
      envParams.appName,
      envParams.appUrl,
      envParams.groupAdminCallBackUrl
    ).generatePools(tokenGenerator, customMessageHandler);

    // Create api gw helper
    const apiGw = new ApiGatewayHelper({
      scope: this,
      id: 'factory-rest-api',
      description: `Questionnaire Factory API - ${envName}`,
      authorizer: cognitoHelper.getAuthorizer(),
      apiKeySecret,
      envName,
      envParams,
    });

    const resourceId = apiGw.getRootResource();

    // Output values
    new CfnOutput(this, 'factory-assets-bucket-name-' + envName, {
      value: s3bucket.bucketName,
      exportName: s3BucketName + 'BucketName',
    });

    new CfnOutput(this, 'factory-assets-bucket-arn-' + envName, {
      value: s3bucket.bucketArn,
      exportName: s3BucketName + 'BucketArn',
    });

    new CfnOutput(this, 'answers-table-name-' + envName, {
      value: answersTable.tableName,
      exportName: answersTableName + 'Name',
    });

    new CfnOutput(this, 'answers-table-arn-' + envName, {
      value: answersTable.tableArn,
      exportName: answersTableName + 'Arn',
    });

    new CfnOutput(this, 'answers-summary-table-name-' + envName, {
      value: answersSummaryTable.tableName,
      exportName: answersSummaryTableName + 'Name',
    });

    new CfnOutput(this, 'answers-summary-table-arn-' + envName, {
      value: answersSummaryTable.tableArn,
      exportName: answersSummaryTableName + 'Arn',
    });

    new CfnOutput(this, 'attribute-table-arn-' + envName, {
      value: aaiAttributeTable.tableName,
      exportName: aaiAttributeTableName + 'Name',
    });

    new CfnOutput(this, 'attribute-table-stream-arn-' + envName, {
      value: aaiAttributeTable.tableStreamArn
        ? aaiAttributeTable.tableStreamArn
        : '',
      exportName: aaiAttributeTableName + 'StreamArn',
    });

    new CfnOutput(this, 'tokens-table-name-' + envName, {
      value: tokensTable.tableName,
      exportName: tokensTableName + 'Name',
    });

    new CfnOutput(this, 'tokens-table-arn-' + envName, {
      value: tokensTable.tableArn,
      exportName: tokensTableName + 'Arn',
    });

    new CfnOutput(this, 'progress-table-name-' + envName, {
      value: progressTable.tableName,
      exportName: progressTableName + 'Name',
    });

    new CfnOutput(this, 'answers-table-stream-arn-' + envName, {
      value: answersTable.tableStreamArn ? answersTable.tableStreamArn : '',
      exportName: answersTableName + 'StreamArn',
    });

    new CfnOutput(this, 'groups-table-name' + '-' + envName, {
      value: groupsTable.tableName,
      exportName: groupsTableName + 'Name',
    });

    new CfnOutput(this, 'group-members-table-name' + '-' + envName, {
      value: groupMembersTable.tableName,
      exportName: groupMembersTableName + 'Name',
    });

    new CfnOutput(this, 'user-settings-table-name' + '-' + envName, {
      value: userSettingsTable.tableName,
      exportName: userSettingsTableName + 'Name',
    });

    new CfnOutput(this, 'factory-rest-api-id-' + envName, {
      exportName: 'FactoryRestApiId-' + envName,
      value: apiGw.getApi().restApiId,
    });

    new CfnOutput(this, 'factory-rest-api-root-resource-' + envName, {
      exportName: 'FactoryRestApiRootResource-' + envName,
      value: resourceId,
    });

    new CfnOutput(this, 'factory-cognito-authorizer-' + envName, {
      exportName: 'FactoryCognitoAuthorizer-' + envName,
      value: cognitoHelper.getAuthorizer().authorizerId,
    });

    new CfnOutput(this, 'profile-api-id-' + envName, {
      exportName: 'ProfileApiId-' + envName,
      value: apiGw.getProfileApi().restApiId,
    });

    new CfnOutput(this, 'profile-api-root-resource-' + envName, {
      exportName: 'ProfileApiRootResource-' + envName,
      value: apiGw.getProfileApi().root.resourceId,
    });

    new CfnOutput(this, 'factory-react-api-url-' + envName, {
      value:
        'https://' +
        apiGw.getApi().restApiId +
        '.execute-api.' +
        Stack.of(this).region +
        '.amazonaws.com/' +
        envName,
      exportName: 'FactoryRestApiUrl-' + envName,
    });

    new CfnOutput(this, 'factory-cognito--authorizer-url-' + envName, {
      value:
        'https://factory-' +
        envName +
        '.auth.' +
        Stack.of(this).region +
        '.amazoncognito.com/login',
      exportName: 'FactoryCognitoAuthorizerUrl-' + envName,
    });

    new CfnOutput(this, 'factory-cognito-authorizer-admin-url-' + envName, {
      value:
        'https://factory-admin-' +
        envName +
        '.auth.' +
        Stack.of(this).region +
        '.amazoncognito.com/login',
      exportName: 'FactoryCognitoAuthorizerAdminUrl-' + envName,
    });

    new CfnOutput(
      this,
      'factory-cognito-authorizer-admin-local-client-' + envName,
      {
        value: cognitoHelper.getClientIdMap().local,
        exportName: 'FactoryCognitoAuthorizerAdminLocalClient-' + envName,
      }
    );

    new CfnOutput(this, 'factory-cognito-userpool-admin-id-' + envName, {
      value: cognitoHelper.getPoolId(),
      exportName: 'FactoryCognitoUserpoolAdminId-' + envName,
    });

    new CfnOutput(this, 'factory-cognito-client-id' + envName, {
      exportName: 'FactoryCognitoClientId-' + envName,
      value: cognitoHelper.getClientIdMap().default,
    });

    new CfnOutput(this, 'factory-cognito-client-secret' + envName, {
      exportName: 'FactoryCognitoClientSecret-' + envName,
      value: cognitoHelper.getCognitoClientSecret(),
    });

    new CfnOutput(this, 'factory-cognito-client-secret-local' + envName, {
      exportName: 'FactoryCognitoClientSecretLocal-' + envName,
      value: cognitoHelper.getCognitoClientSecretLocal(),
    });

    new CfnOutput(this, 'factory-userpool-admin-issuer' + envName, {
      value: `https://cognito-idp.${
        Stack.of(this).region
      }.amazonaws.com/${cognitoHelper.getPoolId()}`,
      exportName: 'FactoryUserpoolAdminIssuer-' + envName,
    });
  }
}

export interface EnvParams {
  groupAdminCallBackUrl: string;
  appName: string;
  appHumanReadableName: string;
  appUrl: string;
  profileApiHostname: string;
  profileApiCert: string;
  aRecordName: string;
  hostedZoneId: string;
  zoneName: string;
  publicCertRef: string;
  verifiedDomainArn: string;
}
