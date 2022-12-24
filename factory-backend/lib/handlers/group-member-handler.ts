import { MethodOptions, RequestValidator } from '@aws-cdk/aws-apigateway';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { IBucket } from '@aws-cdk/aws-s3';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { generateApiDocForMethod } from './generate-docs';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

const GROUP_MEMBER_ENDPOINT = 'groupmember';

export function createGetGroupMembersHandler(
  scope: Construct,
  groupMembersTable: ITable,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const method = 'GET';
  const getGroupMembersHandler = new NodejsFunction(
    scope,
    'Get group members by group id',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-group-members.ts',
      handler: 'getGroupMembers',
      memorySize: 128,
      bundling: { minify: true },
      layers,
      environment: { GROUP_MEMBERS_TABLE_NAME: groupMembersTable.tableName },
    }
  );

  getGroupMembersHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  groupMembersTable.grantReadData(getGroupMembersHandler);

  if (envParams.GENERATEAPIDOC === 'true') {
    generateApiDocForMethod(scope, GROUP_MEMBER_ENDPOINT, method, apiHelper, {
      description: 'List of group members',
    });
  }

  const validator = new RequestValidator(
    scope,
    'FactoryGetGroupMemberValidator',
    {
      requestValidatorName: `FactoryGetGroupMemberValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: false,
      validateRequestParameters: true,
    }
  );

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestParameters: { 'method.request.querystring.group_ids': true },
    methodResponses: commonResponses(register),
  };

  // register to api
  apiHelper.addMethodIntegration(
    method,
    GROUP_MEMBER_ENDPOINT,
    getGroupMembersHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to admin api
  apiHelper.addMethodIntegration(
    method,
    `admin/${GROUP_MEMBER_ENDPOINT}`,
    getGroupMembersHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );

  // register to group admin api
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${GROUP_MEMBER_ENDPOINT}`,
    getGroupMembersHandler,
    { type: AuthType.COGNITO },
    endPointParameters
  );
}

export function createPostGroupMemberHandler(
  scope: Construct,
  groupMembersTable: ITable,
  userSettingsTable: ITable,
  assetsBucket: IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  layers: LayerVersion[]
) {
  const method = 'POST';
  const postGroupMemberHandler = new NodejsFunction(
    scope,
    'Link user and group',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/post-group-member.ts',
      handler: 'postGroupMember',
      memorySize: 128,
      bundling: { minify: true },
      layers,
      environment: {
        GROUP_MEMBERS_TABLE_NAME: groupMembersTable.tableName,
        USER_SETTINGS_TABLE_NAME: userSettingsTable.tableName,
        ASSETS_BUCKET_NAME: assetsBucket.bucketName,
      },
    }
  );

  postGroupMemberHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  groupMembersTable.grantReadWriteData(postGroupMemberHandler);
  userSettingsTable.grantReadWriteData(postGroupMemberHandler);
  assetsBucket.grantRead(postGroupMemberHandler);

  if (envParams.GENERATEAPIDOC === 'true') {
    generateApiDocForMethod(scope, GROUP_MEMBER_ENDPOINT, method, apiHelper);
  }

  const validator = new RequestValidator(
    scope,
    'FactoryPostGroupMemberValidator',
    {
      requestValidatorName: `FactoryPostGroupMemberValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: true,
      validateRequestParameters: false,
    }
  );

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestModels: { 'application/json': register.getModel('PostGroupMember') },
    methodResponses: commonResponses(register),
  };

  // register to api
  apiHelper.addMethodIntegration(
    method,
    GROUP_MEMBER_ENDPOINT,
    postGroupMemberHandler,
    { type: AuthType.JWT },
    endPointParameters
  );
}
