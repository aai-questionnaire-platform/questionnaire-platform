import * as lambda from '@aws-cdk/aws-lambda'
import * as targets from '@aws-cdk/aws-events-targets'
import * as events from '@aws-cdk/aws-events'
import { Construct, Duration, Stack } from '@aws-cdk/core';
import { EnvParams } from '../questionnaire-factory-backend';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Policy, PolicyStatement } from '@aws-cdk/aws-iam';
import { IBucket } from '@aws-cdk/aws-s3';

export function createCognitoBackupHandler(
  scope: Construct,
  envParams: EnvParams,
  adminUserPoolId: string,
  backupBucket: IBucket,
  dependenciesLayer: lambda.LayerVersion,
  codeLayer: lambda.LayerVersion
) {
  const createCognitoBackupHandler = new NodejsFunction(
    scope,
    'Backup users and groups to S3',
    {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: 'src/handlers/backups.ts',
      handler: 'cognitoBackup',
      timeout: Duration.seconds(360),
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
        environment: {
          USERPOOL: adminUserPoolId,
      },
    }
  );

  const iamListUsersGroupsPolicy = new PolicyStatement({
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:ListUsersInGroup',
      'cognito-idp:ListGroups',
      'cognito-idp:AdminListGroupsForUser',
    ],
    resources: [`arn:aws:cognito-idp:${Stack.of(scope).region}:${Stack.of(scope).account}:userpool/${adminUserPoolId}`],
  });

  createCognitoBackupHandler.role?.attachInlinePolicy(
    new Policy(scope, 'list-users-groups-policy', {
      statements: [ iamListUsersGroupsPolicy ],
    }),
  );

  backupBucket.grantReadWrite(createCognitoBackupHandler);

  const eventRule = new events.Rule(scope, 'scheduleRule', {
    schedule: events.Schedule.cron({ minute: '15', hour: '1' }),
    description: 'Copy cognito users and groups to S3 bucket'
  });
  eventRule.addTarget(new targets.LambdaFunction(createCognitoBackupHandler));
  return;
}
