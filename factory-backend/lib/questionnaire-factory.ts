import { Table } from '@aws-cdk/aws-dynamodb';
import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, Fn, Stack } from '@aws-cdk/core';
import { SecretsService } from '../src/services/secrets-service';
import {
  createGetAnswersHandler,
  createPostAnswersHandler,
  createValidateAnswersHandler,
} from './handlers/answer-handlers';
import {
  createGetAnswerSummaryHandler,
  createProcessAnswersHandler,
} from './handlers/answer-summary-handlers';
import {
  createAttributeHandler,
  createAttributePointerHandler
} from './handlers/attribute-handlers';
import {
  createGetGroupMembersHandler,
  createPostGroupMemberHandler,
} from './handlers/group-member-handler';
import {
  createGetGroupsHandler,
  createPostNewGroupHandler,
  createPutGroupHandler,
} from './handlers/groups-handlers';
import { createOrganizationsHandler } from './handlers/organization-handlers';
import {
  createGetProgressHandler,
  createPostProgressHandler,
} from './handlers/progress-handlers';
import {
  createGetQuestionnaireHandler,
  createPostQuestionnaireHandler,
} from './handlers/questionnaire-handlers';
import {
  createGetUserSettingsHandler,
  createPostUserSettingsHandler,
} from './handlers/user-settings-handlers';
import { ApiGatewayHelper } from './helpers/apigw-helper';
import { ModelRegister } from './helpers/model-register';
import { EnvParams } from './questionnaire-factory-backend';
import {
  createDeleteUserAttributesHandler,
  createGetUserAttributesHandler
} from './handlers/profile-api-handlers';
import { createCognitoBackupHandler } from './handlers/backup-handlers';

export class QuestionnaireFactoryService extends Construct {
  //Register of api gw models
  register = new ModelRegister();
  profileApiRegister = new ModelRegister();

  constructor(
    scope: Stack,
    id: string,
    apiHelper: ApiGatewayHelper,
    assetsBucketName: string,
    answersTableName: string,
    answersTableDynamoDbStreamArn: string,
    answersSummaryTableName: string,
    aaiAttributesTableName: string,
    aaiAttributesTableDynamoDbStreamArn: string,
    tokensTableName: string,
    progressTableName: string,
    userSettingsTableName: string,
    minNumberOfResponses: string,
    groupsTableName: string,
    groupMembersTableName: string,
    envParams: EnvParams,
    layers: any
  ) {
    super(scope, id);

    //Register models
    this.register.registerModels(scope, apiHelper.api);

    //Create import for assets bucket
    const assetsBucket = Bucket.fromBucketName(
      this,
      'imported-bucket-from-name',
      assetsBucketName
    );

    // Create object for backup bucket
    const backupBucket = Bucket.fromBucketName(
      scope,
      'imported-backupbucket-name',
      `questionnairebackup-${Stack.of(scope).account}`
    );

    //Create import for answers table stream from table dynamodb stream arn
    const answersTable = Table.fromTableAttributes(
      this,
      'imported-answers-table-dynamo-stream-from-attributes',
      {
        tableName: answersTableName,
        tableStreamArn: answersTableDynamoDbStreamArn,
      }
    );

    //Create import for answer summary table
    const answersSummaryTable = Table.fromTableName(
      this,
      'imported-answers-summary-table-from-name',
      answersSummaryTableName
    );

    // Create import for aai attribute table
    const aaiAttributesTable = Table.fromTableAttributes(
      this,
      'imported-aai-attributes-table-from-attributes',
      {
        tableName: aaiAttributesTableName,
        tableStreamArn: aaiAttributesTableDynamoDbStreamArn
      }
    );

    // Create import for aai tokens table
    const tokensTable = Table.fromTableAttributes(
      this,
      'tokens-table-from-name',
      {
        tableName: tokensTableName,
        globalIndexes: ['GSI1']
      }
    );

    //Create import for progress table
    const progressTable = Table.fromTableName(
      this,
      'progress-table-from-name',
      progressTableName
    );

    //Create import for progress table
    const groupsTable = Table.fromTableAttributes(
      this,
      'groups-table-from-name',
      {
        tableName: groupsTableName,
        globalIndexes: ['pin-code-index'],
        localIndexes: ['valid-until-index', 'organization_name-index'],
      }
    );

    //Create import for user settings table
    const userSettingsTable = Table.fromTableName(
      this,
      'user-settings-table-from-name',
      userSettingsTableName
    );

    //Create import for user settings table
    const groupMembersTable = Table.fromTableName(
      this,
      'group-members-table-from-name',
      groupMembersTableName
    );

    const adminUserPoolId = Fn.importValue(`FactoryCognitoUserpoolAdminId-${envParams.ENV_NAME}`);
    const apiKeySecret = new SecretsService().getApiKey(scope, envParams.ENV_NAME);

    //Create organizations handler
    //GET /organizations
    createOrganizationsHandler(
      this,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //Create questionnaire handler
    //GET /questionnaire
    createGetQuestionnaireHandler(
      this,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //POST /questionnaire
    createPostQuestionnaireHandler(
      this,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //Create get answers handler
    //GET /answers
    createGetAnswersHandler(this,
      answersTable,
      apiHelper,
      this.register,
      envParams,
      [
        layers.dependencyLayer,
        layers.codeLayer,
      ]);

    //Create answer validation endpoint handler
    //POST /answers/validate
    createValidateAnswersHandler(this, assetsBucket, apiHelper, this.register, [
      layers.dependencyLayer,
      layers.codeLayer,
    ]);

    //Create create answers handler
    //POST /answers
    createPostAnswersHandler(
      this,
      answersTable,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      [layers.dependencyLayer, layers.codeLayer]
    );

    //Create process answer summary handler
    //DynamoDB stream triggered
    createProcessAnswersHandler(
      this,
      answersTable,
      answersSummaryTable,
      assetsBucket,
      layers.dependencyLayer,
      layers.codeLayer
    );

    // Create process answer summary handler
    // DynamoDB stream triggered from answers -table.
    createAttributeHandler(
      this,
      envParams,
      answersTable,
      aaiAttributesTable,
      layers.dependencyLayer,
      layers.codeLayer
    );

    // Create add attribute pointer handler
    // DynaoDB stream triggered from aai-attribute -table.
    createAttributePointerHandler(
      this,
      envParams,
      aaiAttributesTable,
      tokensTable,
      layers.dependencyLayer,
      layers.codeLayer
    )

    //Create get answer summary handler
    //GET /answersummary
    createGetAnswerSummaryHandler(
      this,
      answersSummaryTable,
      apiHelper,
      this.register,
      minNumberOfResponses,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //Generates the get progress handler
    //GET /progress
    createGetProgressHandler(
      this,
      answersTable,
      progressTable,
      groupMembersTable,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //Create post progress handler
    //POST /progress
    createPostProgressHandler(
      this,
      progressTable,
      answersTable,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    //Create get groups handler
    //GET /groups
    createGetGroupsHandler(
      this,
      apiHelper,
      groupsTable,
      this.register,
      envParams,
      [
        layers.dependencyLayer,
        layers.codeLayer,
      ]);

    // Create post new group handler
    // POST /groups
    createPostNewGroupHandler(
      this,
      apiHelper,
      groupsTable,
      this.register,
      envParams,
      [
        layers.dependencyLayer,
        layers.codeLayer,
      ]);

    // Create update group handler
    // PUT /groups
    createPutGroupHandler(
      this,
      apiHelper,
      groupsTable,
      this.register,
      envParams,
      [
        layers.dependencyLayer,
        layers.codeLayer,
      ]);

    //Create post user settings handler
    //POST /settings
    createGetUserSettingsHandler(
      this,
      userSettingsTable,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer,
      apiKeySecret
    );

    // Create post settings handler
    // POST /settings
    createPostUserSettingsHandler(
      this,
      userSettingsTable,
      apiHelper,
      this.register,
      envParams,
      layers.dependencyLayer,
      layers.codeLayer
    );

    // Create post group member handler
    // GET /groupmember
    createGetGroupMembersHandler(
      this,
      groupMembersTable,
      apiHelper,
      this.register,
      envParams,
      [layers.dependencyLayer, layers.codeLayer]
    );

    // Create post group member handler
    // POST /groupmember
    createPostGroupMemberHandler(
      this,
      groupMembersTable,
      userSettingsTable,
      assetsBucket,
      apiHelper,
      this.register,
      envParams,
      [layers.dependencyLayer, layers.codeLayer]
    );

    // Profile API

    // GET /auroraai/profile-management/v1/user_attributes
    createGetUserAttributesHandler(
      this,
      aaiAttributesTable,
      apiHelper,
      this.profileApiRegister,
      layers.dependencyLayer,
      layers.codeLayer
    );

    // DELETE /auroraai/profile-management/v1/user_attributes
    createDeleteUserAttributesHandler(
      this,
      aaiAttributesTable,
      apiHelper,
      this.profileApiRegister,
      layers.dependencyLayer,
      layers.codeLayer
    );

    if (envParams.COGNITOBACKUP === 'true') {
      createCognitoBackupHandler(
        this,
        envParams,
        adminUserPoolId,
        backupBucket,
        layers.dependencyLayer,
        layers.codeLayer
      );
    }

    apiHelper.deployToStage(scope, envParams.ENV_NAME);
  }
}
