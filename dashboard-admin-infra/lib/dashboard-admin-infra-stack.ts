//vpc-stack.ts
import * as s3 from '@aws-cdk/aws-s3';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ApiGateway } from '@aws-cdk/aws-route53-targets';
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import {
  ClientAttributes,
  IUserPool,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import {
  CognitoUserPoolsAuthorizer,
  IdentitySource,
} from '@aws-cdk/aws-apigateway';

import { ApiGatewayHelper } from './apigw-helper';

export class DashboardAdminInfraStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envName: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const frontendParams: EnvParams = {
      hostedZoneId: 'HOSTEDZONEID',
      hostname: 'dashboard-admin-' + envName,
      zonename: 'yourdomain.fi',
      publicCertRef: 'arn:aws:acm:us-east-1:ACCOUNTID:certificate/CERTID',
    };

    const backendParams: EnvParams = {
      hostedZoneId: 'HOSTEDZONEID',
      hostname: 'dashboard-admin-api-' + envName,
      zonename: 'yourdomain.fi',
      publicCertRef: 'arn:aws:acm:eu-west-1:ACCOUNTID:certificate/CERTID',
    };

    const userPool: IUserPool = new UserPool(this, 'dashboard-admin-userpool', {
      userPoolName: `dashboard-admin-${envName}-userpool`,
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const redirectURL = `http://localhost:3000/login`; // TODO: replace with dashboard-admin-${envName}.yourdomain.fi
    const logoutUrl = `http://localhost:3000/logout`;

    const standardCognitoAttributes = {
      email: true,
    };

    const clientReadAttributes = new ClientAttributes().withStandardAttributes(
      standardCognitoAttributes
    );

    const clientWriteAttributes = new ClientAttributes().withStandardAttributes(
      {
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      }
    );

    const userPoolClient = new UserPoolClient(
      this,
      'dashboard-admin-userpool-client',
      {
        userPool,
        oAuth: {
          flows: {
            implicitCodeGrant: true,
          },
          scopes: [
            OAuthScope.PHONE,
            OAuthScope.EMAIL,
            OAuthScope.OPENID,
            OAuthScope.PROFILE,
            OAuthScope.COGNITO_ADMIN,
          ],
          callbackUrls: [redirectURL],
          logoutUrls: [logoutUrl],
        },
        supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
        readAttributes: clientReadAttributes,
        writeAttributes: clientWriteAttributes,
      }
    );

    const domain = userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: `dashboard-admin-${envName}`,
      },
    });

    const signInUrl = domain.signInUrl(userPoolClient, {
      redirectUri: redirectURL,
    });

    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      `dashboard-admin-userpool-authorizer-${envName}`,
      {
        cognitoUserPools: [userPool],
        authorizerName: `dashboard-admin-authorizer-${envName}`,
        identitySource: IdentitySource.header('Authorization'),
      }
    );

    const s3BucketName = `DashboardAdminAssets-${envName}`;

    const s3bucket = new s3.Bucket(this, s3BucketName, {
      bucketName: s3BucketName.toLowerCase(),
      versioned: true,
    });

    const backendCertificate = Certificate.fromCertificateArn(
      this,
      `${id}-${backendParams.zonename}-Backend-Certificate`,
      backendParams.publicCertRef
    );

    const dashboardAdminFrontendHostedZone =
      HostedZone.fromHostedZoneAttributes(
        this,
        'DashboardAdminFrontend-HostedZone',
        {
          hostedZoneId: frontendParams.hostedZoneId,
          zoneName: frontendParams.zonename,
        }
      );

    const dashboardAdminBackendHostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      'DashboardAdminBackend-HostedZone',
      {
        hostedZoneId: backendParams.hostedZoneId,
        zoneName: backendParams.zonename,
      }
    );

    // Create api gw helper
    const apiGw = new ApiGatewayHelper({
      scope: this,
      id: 'dashboard-admin-rest-api',
      description: `dashboard-admin-api-${envName}`,
      authorizer,
      envName,
      certificate: backendCertificate,
      domainName: `${backendParams.hostname}.${backendParams.zonename}`,
    });

    new ARecord(this, `DashboardAdminARecord-${backendParams.hostname}`, {
      target: RecordTarget.fromAlias(new ApiGateway(apiGw.getApi())),
      zone: dashboardAdminBackendHostedZone,
      recordName: backendParams.hostname,
    });

    const resourceId = apiGw.getRootResource();

    // Output values
    new CfnOutput(this, `dashboard-admin-signin-url-${envName}`, {
      value: signInUrl,
      exportName: `cognito-signin-url-${envName}`,
    });

    new CfnOutput(this, `dashboard-admin-assets-bucket-name-${envName}`, {
      value: s3bucket.bucketName,
      exportName: `${s3BucketName}-Bucket-Name`,
    });

    new CfnOutput(this, `dashboard-admin-assets-bucket-arn-${envName}`, {
      value: s3bucket.bucketArn,
      exportName: `${s3BucketName}-Bucket-Arn`,
    });

    new CfnOutput(this, `dashboard-admin-rest-api-id-${envName}`, {
      exportName: 'DashboardAdminRestApiId-' + envName,
      value: apiGw.getApi().restApiId,
    });

    new CfnOutput(this, `dashboard-admin-cognito-userpool-${envName}`, {
      exportName: 'DashboardAdminCognitoPool-' + envName,
      value: userPool.userPoolId,
    });

    new CfnOutput(this, `dashboard-admin-rest-api-root-resource-${envName}`, {
      exportName: 'DashboardAdminRestApiRootResource-' + envName,
      value: resourceId,
    });

    new CfnOutput(this, `dashboard-admin-rest-api-url-${envName}`, {
      value:
        'https://' +
        apiGw.getApi().restApiId +
        '.execute-api.' +
        Stack.of(this).region +
        '.amazonaws.com/' +
        envName,
      exportName: `DashboardAdminRestApiUrl-${envName}`,
    });
  }
}

export interface EnvParams {
  hostedZoneId: string;
  zonename: string;
  hostname: string;
  publicCertRef: string;
}
