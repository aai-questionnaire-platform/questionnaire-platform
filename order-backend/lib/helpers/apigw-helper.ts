import {
  AuthorizationType,
  Cors,
  Deployment,
  IResource,
  IRestApi,
  LambdaIntegration,
  MethodOptions,
  RestApi,
  TokenAuthorizer,
} from '@aws-cdk/aws-apigateway';
import { IFunction, Runtime } from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { AuthorizationOptions, AuthType } from './types';

export class ApiGatewayHelper extends cdk.Construct {
  api: IRestApi;
  cognitoAuthorizerId: string;
  jwtTokenAuthorizer: TokenAuthorizer;

  constructor(
    scope: cdk.Stack,
    envName: string,
    envParams: any,
    restApiId: string,
    rootResourceKey: string,
    cognitoAuthorizerKey: string,
    layers: any
  ) {
    super(scope, envName);

    const jwtAuthorizerFn = new NodejsFunction(scope, 'JWT Token Authorizer', {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/jwt-authorizer/jwtAuthorizer.ts',
      handler: 'handler',
      memorySize: 128,
      layers: [layers.dependencyLayer, layers.codeLayer],
      environment: envParams,
    });

    this.jwtTokenAuthorizer = new TokenAuthorizer(
      this,
      'defaultJwtAuthorizer',
      {
        handler: jwtAuthorizerFn,
      }
    );

    this.api = RestApi.fromRestApiAttributes(
      this,
      'Order REST Api - ' + envName,
      {
        restApiId: cdk.Fn.importValue(restApiId),
        rootResourceId: cdk.Fn.importValue(rootResourceKey),
      }
    );

    this.cognitoAuthorizerId = cdk.Fn.importValue(cognitoAuthorizerKey);
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
      ...this.resolveAuthenticationParams(authorization),
    };
    //Add the integration to api

    if (requestParameters) {
      resource.addMethod(method, serviceIntegration, requestParametersWithAuth);
    }
  }

  private resolveAuthenticationParams(
    authorization: AuthorizationOptions
  ): MethodOptions {
    switch (authorization.type) {
      case AuthType.JWT:
        return {
          authorizer: this.jwtTokenAuthorizer,
          authorizationType: AuthorizationType.CUSTOM,
        };
      case AuthType.API_KEY:
        return {
          authorizer: undefined,
          authorizationScopes: undefined,
          apiKeyRequired: true,
        };
      default:
        return {
          authorizationType: AuthorizationType.NONE,
          authorizationScopes: undefined,
        };
    }
  }

  public deployToStage(scope: cdk.Stack, envName: string) {
    const deployment = new Deployment(scope, 'rest-api-deployment-' + envName, {
      api: this.api,
    });

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
