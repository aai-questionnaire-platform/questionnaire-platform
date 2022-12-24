import * as cdk from "@aws-cdk/core";
import { IFunction } from "@aws-cdk/aws-lambda";
import {
  Cors,
  LambdaIntegration,
  MethodOptions,
  RestApi,
  Deployment,
  Stage,
  Authorizer,
} from "@aws-cdk/aws-apigateway";

export class ApiGatewayHelper extends cdk.Construct {
  api: RestApi;
  documentationVersion: string = "1";
  authorizer: Authorizer;

  constructor(
    scope: cdk.Stack, 
    id: string, 
    description: string,
    authorizer: Authorizer
  ) {
    super(scope, id);

    this.api = new RestApi(scope, "questionnaire-admin-rest-api", {
      restApiName: description,
      description: description,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      deploy: false,
      retainDeployments: true,
    });

    this.authorizer = authorizer;
    this.authorizer._attachToApi(this.api);
  }

  public getApi(): RestApi {
    return this.api;
  }

  public getRootResource(): string {
    return this.api.root.resourceId;
  }

  public addMethodIntegration(
    method: string,
    path: string,
    func: IFunction
  ): void {
    const customIntegration = new LambdaIntegration(func, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' },
    });

    //Add new resource, if necessary
    var resource = this.api.root.getResource(path);
    if (!resource) {
      resource = this.api.root.addResource(path, {
        //This is a regular PIA
        defaultCorsPreflightOptions: {
          allowOrigins: Cors.ALL_ORIGINS,
          allowMethods: Cors.ALL_METHODS,
        },
      });
    }

    resource.addMethod(method, customIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    });
  }

  public deployToStage(scope: cdk.Stack, envName: string) {
    const deployment = new Deployment(
      scope,
      "questionnaire-admin-rest-api-deployment-" + envName,
      {
        api: this.api,
      }
    );
    const stage = new Stage(
      scope,
      "questionnaire-admin-rest-api-stage-" + envName,
      {
        deployment,
        stageName: envName,
      }
    );
    this.api.deploymentStage = stage;
  }
}
