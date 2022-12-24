import * as cdk from "@aws-cdk/core";
import {
  Authorizer,
  Cors,
  Deployment,
  ResponseType,
  RestApi,
  Stage,
} from "@aws-cdk/aws-apigateway";

interface ApiGatewayHelperOptions {
  scope: cdk.Stack;
  id: string;
  description: string;
  envName: string;
  authorizer: Authorizer;
}

export class ApiGatewayHelper extends cdk.Construct {
  api: RestApi;
  documentationVersion: string = "1";
  authorizer: Authorizer;

  constructor({
    scope,
    id,
    description,
    authorizer,
    envName,
  }: ApiGatewayHelperOptions) {
    super(scope, id);

    this.api = new RestApi(scope, "order-api", {
      restApiName: description,
      description: description,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      deploy: false,
      retainDeployments: true,
    });

    const deployment = new Deployment(
      scope,
      `order-api-deployment-${envName}`,
      {
        api: this.api,
      }
    );

    // stage needs to be created here because an usage plan must be attached to a stage
    const stage = new Stage(scope, `order-api-stage-${envName}`, {
      deployment,
      stageName: envName,
    });
    this.api.deploymentStage = stage;

    if (authorizer){
      this.authorizer = authorizer;
      this.authorizer._attachToApi(this.api);
    }

    this.api.addGatewayResponse("auth-denied-response", {
      type: ResponseType.UNAUTHORIZED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Methods": "'*'",
      },
    });
  }

  public getApi(): RestApi {
    return this.api;
  }

  public getRootResource(): string {
    return this.api.root.resourceId;
  }
}
