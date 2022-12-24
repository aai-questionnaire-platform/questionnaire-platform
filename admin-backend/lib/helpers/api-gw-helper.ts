import {
  AuthorizationType,
  Cors,
  Deployment,
  IResource,
  IRestApi,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from '@aws-cdk/aws-apigateway';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Construct, Fn, Stack } from '@aws-cdk/core';
import { AuthorizationOptions, AuthType } from './types';
import * as cdk from '@aws-cdk/core';

export class ApiGatewayHelper extends Construct {
  api: IRestApi;
  authorizerId: string;

  constructor(
    scope: Stack,
    id: string,
    restApiId: string,
    rootResourceKey: string,
    authorizerKey: string
  ) {
    super(scope, id);

    this.api = RestApi.fromRestApiAttributes(this, id, {
      restApiId: Fn.importValue(restApiId),
      rootResourceId: Fn.importValue(rootResourceKey),
    });

    this.authorizerId = cdk.Fn.importValue(authorizerKey);
  }

  public addMethodIntegration(
    method: string,
    path: string,
    func: IFunction,
    authorization: AuthorizationOptions,
    requestParameters?: MethodOptions
  ): void {
    const serviceIntegration = new LambdaIntegration(func, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const resource = createResources(
      this.api.root,
      path.split('/').filter(Boolean)
    );

    const requestParametersWithAuth: MethodOptions = {
      ...requestParameters,
      authorizer: {
        authorizerId: this.authorizerId,
        authorizationType: AuthorizationType.COGNITO,
      },
      authorizationScopes: authorization.authorizationScopes || undefined,
      apiKeyRequired: authorization.type === AuthType.API_KEY,
    };

    //Add the integration to api
    if (requestParameters) {
      resource.addMethod(method, serviceIntegration, requestParametersWithAuth);
    }
  }

  public deployToStage(scope: Stack, envName: string) {
    const deployment = new Deployment(
      scope,
      `admin-backend-rest-api-deployment-${envName}`,
      {
        api: this.api,
      }
    );

    // deployment.resource is marked private so this is a dirty hack to use an existing stage created in the infra stack
    (deployment as any).resource.stageName = envName;
  }
}

/**
 * Recursively create subresources from a splitted path
 * @param root
 * @param pathFragments
 * @returns
 */
function createResources(root: IResource, pathFragments: string[]): IResource {
  const pathFragment = pathFragments[0];
  const isLastFragment = pathFragments.length === 1;
  let resource = root.getResource(pathFragment);

  if (!resource) {
    resource = root.addResource(
      pathFragment,
      // only add CORS options to the last fragment (the actual endpoint)
      isLastFragment
        ? {
            defaultCorsPreflightOptions: {
              allowOrigins: Cors.ALL_ORIGINS,
              allowMethods: Cors.ALL_METHODS,
            },
          }
        : {}
    );
  }

  return isLastFragment
    ? resource
    : createResources(resource, pathFragments.slice(1));
}
