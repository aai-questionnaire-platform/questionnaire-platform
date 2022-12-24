import * as cdk from '@aws-cdk/core';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { QuestionnaireFactoryService } from './questionnaire-factory';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';

export class QuestionnaireFactoryBackend extends cdk.Stack {
  constructor(scope: cdk.Construct, env: string, props?: cdk.StackProps) {
    const id = `QuestionnaireFactoryBackend-${env}`;

    super(scope, id, props);

    const envParamMap = new Map<string, EnvParams>();
    envParamMap.set('muntesti-local', {
      JWT_ISSUER: 'https://auroraai.astest.suomi.fi/oauth',
      JWT_AUDIENCE: '3267f78b-993d-413c-8ecb-5a3233cc4206', // MunTesti
      PROFILEAPI_JWT_AUDIENCE: 'https://muntesti-api.kyselypeli.fi',
      ENV_NAME: env,
      AAI_SERVICE_URL: 'https://auroraai.astest.suomi.fi/',
      NEXTAUTH_PROVIDER: 'auroraai-mt-local',
      AAI_ATTRIBUTES: 'tampere_demo_flag',
      GENERATEAPIDOC: 'false',
      COGNITOBACKUP: 'false',
    });

    const envParams = envParamMap.has(env)
      ? envParamMap.get(env)
      : envParamMap.get('muntesti-local');

    const depLayer = new LayerVersion(this, 'factoryDependenciesLayer', {
      code: Code.fromAsset('./src/node_modules/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'External modules layer',
    });

    const codeLayer = new LayerVersion(this, 'factoryCodeLayer', {
      code: Code.fromAsset('./src/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'Code layer layer',
    });

    const layers = { dependencyLayer: depLayer, codeLayer: codeLayer };

    //Import assets bucket name
    const ASSETS_BUCKET_NAME = cdk.Fn.importValue(
      `FactoryAssets-${env}BucketName`
    );

    //Import answers table name
    const ANSWERS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryAnswersTable-${env}Name`
    );

    // Import attribute table name
    const ATTRIBUTE_TABLE_NAME = cdk.Fn.importValue(
      `FactoryAaiAttributeTable-${env}Name`
    );

    // Import tokens table name
    const TOKENS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryAaiTokensTable-${env}Name`
    );

    //Import answers summary table name
    const ANSWERS_SUMMARY_TABLE_NAME = cdk.Fn.importValue(
      `FactoryAnswersSummaryTable-${env}Name`
    );

    const GROUP_MEMBERS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryGroupMembersTable-${env}Name`
    );

    //Import progress table name
    const PROGRESS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryProgressTable-${env}Name`
    );

    //Import user settings table name
    const USER_SETTINGS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryUserSettingsTable-${env}Name`
    );

    // Import answers summary table dynamodb stream arn
    const ANSWERS_DYNAMO_DB_STREAM_ARN = cdk.Fn.importValue(
      `FactoryAnswersTable-${env}StreamArn`
    );

    // Import answers summary table dynamodb stream arn
    const ATTRIBUTE_DYNAMO_DB_STREAM_ARN = cdk.Fn.importValue(
      `FactoryAaiAttributeTable-${env}StreamArn`
    );

    //Import groups table name
    const GROUPS_TABLE_NAME = cdk.Fn.importValue(
      `FactoryGroupsTable-${env}Name`
    );

    //Minimum number of answers required to generate the summary
    const GROUP_ANSWER_COUNT_LIMIT = '10';

    const apiGw = new ApiGatewayHelper(
      this,
      env,
      envParams,
      'FactoryRestApiId-' + env,
      'FactoryRestApiRootResource-' + env,
      'FactoryCognitoAuthorizer-' + env,
      layers
    );

    //Create the service and pass along the stack helper
    //Instantiate service
    new QuestionnaireFactoryService(
      this,
      'QuestionnaireFactoryService',
      apiGw,
      ASSETS_BUCKET_NAME,
      ANSWERS_TABLE_NAME,
      ANSWERS_DYNAMO_DB_STREAM_ARN,
      ANSWERS_SUMMARY_TABLE_NAME,
      ATTRIBUTE_TABLE_NAME,
      ATTRIBUTE_DYNAMO_DB_STREAM_ARN,
      TOKENS_TABLE_NAME,
      PROGRESS_TABLE_NAME,
      USER_SETTINGS_TABLE_NAME,
      GROUP_ANSWER_COUNT_LIMIT,
      GROUPS_TABLE_NAME,
      GROUP_MEMBERS_TABLE_NAME,
      envParams!,
      layers
    );
  }
}

// Game-specific parameters
export interface EnvParams {
  // JWT issuer that is accepted
  JWT_ISSUER: string;
  // JWT audience for front-end client api
  JWT_AUDIENCE: string;
  // JWT audience (==endpoint url) for Profile API
  PROFILEAPI_JWT_AUDIENCE: string;
  ENV_NAME: string;
  // AuroraAI attribute names used the application
  AAI_ATTRIBUTES: string;
  // AuroraAI core components service URL
  AAI_SERVICE_URL: string;
  // Next-auth provider used when the access_token is written to database
  NEXTAUTH_PROVIDER: string;
  // Generate API docs when deploying the stack.
  // This will increase number of items in stack and may introduce problems with stack updates.
  // Therefore, it's disabled by default.
  GENERATEAPIDOC: string;
  // Enable copying Cognito users and groups to S3 bucket to facilitate backups
  COGNITOBACKUP?: string;
}
