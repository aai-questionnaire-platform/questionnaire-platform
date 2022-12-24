import * as cdk from '@aws-cdk/core';
import {
  Authorizer,
  Cors,
  Deployment,
  ResponseType,
  RestApi,
  Stage,
} from '@aws-cdk/aws-apigateway';
import { ISecret } from '@aws-cdk/aws-secretsmanager';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ApiGateway } from '@aws-cdk/aws-route53-targets';
import { EnvParams } from './questionnaire-factory-infra-stack';

interface ApiGatewayHelperOptions {
  scope: cdk.Stack;
  id: string;
  description: string;
  apiKeySecret: ISecret;
  envName: string;
  authorizer: Authorizer;
  envParams?: EnvParams;
}

export class ApiGatewayHelper extends cdk.Construct {
  api: RestApi;
  profileApi: RestApi;
  documentationVersion: string = '1';
  authorizer: Authorizer;

  constructor({
    scope,
    id,
    description,
    authorizer,
    apiKeySecret,
    envName,
    envParams
  }: ApiGatewayHelperOptions) {
    super(scope, id);

    this.api = new RestApi(scope, `factory-api-${envName}`, {
      restApiName: description,
      description: description,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      deploy: false,
      retainDeployments: true,
    });

    this.profileApi = new RestApi(scope, `profile-api-${envName}`, {
      restApiName: 'AuroraAI Profile API - ' + envName,
      description: 'API for processing user attributes for AuroraAI',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      deploy: true,
      domainName: {
        domainName: envParams!.profileApiHostname,
        certificate: Certificate.fromCertificateArn(this, 'Public cert for root domain', envParams!.profileApiCert),
      }
    });

    new ARecord(this, 'profile api alias record - ' + envName, {
      recordName: envParams!.profileApiHostname,
      zone: HostedZone.fromHostedZoneAttributes(scope, 'hosted zone for profile api', {
        hostedZoneId: envParams!.hostedZoneId,
        zoneName: envParams!.zoneName
        }),
      target: RecordTarget.fromAlias(new ApiGateway(this.profileApi))
    });

    // we deploy the api here because an api key can not be created if the targeting api is not deployed
    const deployment = new Deployment(
      scope,
      `factory-api-deployment-${envName}`,
      {
        api: this.api,
      }
    );

    // stage needs to be created here because an usage plan must be attached to a stage
    const stage = new Stage(scope, `factory-api-stage-${envName}`, {
      deployment,
      stageName: envName,
    });
    this.api.deploymentStage = stage;

    this.authorizer = authorizer;
    this.authorizer._attachToApi(this.api);

    const apiKey = this.api.addApiKey(`Factory-QuestionnaireInfra-ApiKey`, {
      apiKeyName: `Factory-Admin-ApiKey-${envName}`,
      value: apiKeySecret.secretValue.toString(),
    });

    // api key needs an usage plan to work
    const plan = this.api.addUsagePlan('Factory-QuestionnaireInfra-UsagePlan', {
      name: 'Factory-Admin-UsagePlan',
      apiStages: [
        {
          api: this.api,
          stage: this.api.deploymentStage,
        },
      ],
    });
    plan.addApiKey(apiKey);

    this.api.addGatewayResponse('auth-denied-response', {
      type: ResponseType.UNAUTHORIZED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'*'",
      },
    });
  }

  public getApi(): RestApi {
    return this.api;
  }

  public getRootResource(): string {
    return this.api.root.resourceId;
  }

  public getProfileApi(): RestApi {
    return this.profileApi;
  }
}
