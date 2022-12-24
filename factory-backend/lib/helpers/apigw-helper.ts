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
import {IFunction, Runtime} from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import {AuthorizationOptions, AuthType} from './types';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';


export class ApiGatewayHelper extends cdk.Construct {
  api: IRestApi;
  profileApi: IRestApi;
  cognitoAuthorizerId: string;
  jwtTokenAuthorizer: TokenAuthorizer;
  profileApiJwtTokenAuthorizer: TokenAuthorizer;

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

    // JWT authorizer for frontend client api
    const jwtAuthorizerFn = new NodejsFunction(scope, 'Client API JWT Token Authorizer', {
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

    // JWT authorizer for auroraai profile api
    const profileApiJwtAuthorizerFn = new NodejsFunction(scope, 'Profile API Token Authorizer', {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/jwt-authorizer/jwtAuthorizer.ts',
      handler: 'handler',
      memorySize: 128,
      layers: [layers.dependencyLayer, layers.codeLayer],
      environment: {
        JWT_ISSUER: envParams.JWT_ISSUER,
        JWT_AUDIENCE: envParams.PROFILEAPI_JWT_AUDIENCE
      },
    });

    this.profileApiJwtTokenAuthorizer = new TokenAuthorizer(
      this,
      'profileApiJwtAuthorizer',
      {
        handler: profileApiJwtAuthorizerFn,
      }
    );

    this.api = RestApi.fromRestApiAttributes(
      this,
      'Factory REST Api - ' + envName,
      {
        restApiId: cdk.Fn.importValue(restApiId),
        rootResourceId: cdk.Fn.importValue(rootResourceKey),
      }
    );

    this.profileApi = RestApi.fromRestApiAttributes(
      this,
      'Profile API - ' + envName,
      {
        restApiId: cdk.Fn.importValue('ProfileApiId-' + envName),
        rootResourceId: cdk.Fn.importValue('ProfileApiRootResource-' + envName)
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

  public createProfileApiRootPath(rootPath: string) {
    const apiRoot = this.profileApi.root;

    return createResources(
      this.profileApi.root,
      rootPath.split('/').filter(Boolean)
    );
  }

  public addProfileApiMethodIntegration(
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
      this.profileApi.root,
      path.split('/').filter(Boolean)
    );

    const requestParametersWithAuth: MethodOptions = {
      ...requestParameters,
      ...this.resolveAuthenticationParams(authorization)
    };

    resource.addMethod(method, serviceIntegration, requestParametersWithAuth);
  }

  private resolveAuthenticationParams(
    authorization: AuthorizationOptions
  ): MethodOptions {
    switch (authorization.type) {
      case AuthType.COGNITO:
        return {
          authorizer: {
            authorizerId: this.cognitoAuthorizerId,
            authorizationType: AuthorizationType.COGNITO,
          },
          authorizationScopes: authorization.authorizationScopes || undefined,
          apiKeyRequired: false,
        };
      case AuthType.JWT:
        return {
          authorizer: this.jwtTokenAuthorizer,
          authorizationType: AuthorizationType.CUSTOM,
        };
      case AuthType.PROFILEAPI_JWT:
        return {
          authorizer: this.profileApiJwtTokenAuthorizer,
          authorizationType: AuthorizationType.CUSTOM,
        }
      case AuthType.API_KEY:
        return {
          authorizer: undefined,
          authorizationScopes: undefined,
          apiKeyRequired: true,
        };
      default:
        return {
          authorizer: undefined,
          apiKeyRequired: false,
        };
    }
  }

  public deployToStage(scope: cdk.Stack, envName: string) {
    const deployment = new Deployment(scope, 'rest-api-deployment-' + envName, {
      api: this.api,
    });

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
