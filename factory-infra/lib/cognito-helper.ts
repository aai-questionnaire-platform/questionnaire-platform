import {
  CognitoUserPoolsAuthorizer,
  IdentitySource,
} from '@aws-cdk/aws-apigateway';
import {
  AccountRecovery,
  ClientAttributes,
  Mfa,
  OAuthScope,
  ResourceServerScope,
  StringAttribute,
  UserPool,
} from '@aws-cdk/aws-cognito';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Construct, Duration, Stack } from '@aws-cdk/core';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from '@aws-cdk/custom-resources';

enum AuthorizationScopes {
  PLAY = 'questionnaire:play',
  APPROVE = 'questionnaire:approve',
}

export class CognitoHelper extends Construct {
  private authorizer: CognitoUserPoolsAuthorizer;
  private clientIdMap: { default: string; local: string } = {
    default: '',
    local: '',
  };
  private poolId: string;
  private authPath: string;
  private params: EnvParams;

  constructor(
    private scope: Stack,
    id: string,
    private envName: string,
    private appName: string,
    private appUrl: string,
    private groupAdminCallBackUrl: string
  ) {
    super(scope, id);

    this.authPath = this.groupAdminCallBackUrl;

    this.params = {
      callbackUrls: [`${this.appUrl}/${this.groupAdminCallBackUrl}`],
      logoutUrls: [this.appUrl],
    };
  }

  generatePools(tokenGenerator: IFunction, customMessageHandler: IFunction) {
    const userPool = this.createUserPool(tokenGenerator, customMessageHandler);

    this.poolId = userPool.userPoolId;

    const playScope = new ResourceServerScope({
      scopeName: AuthorizationScopes.PLAY,
      scopeDescription: 'Allows playing the game',
    });

    const approveScope = new ResourceServerScope({
      scopeName: AuthorizationScopes.APPROVE,
      scopeDescription: 'Allows approving game lavels',
    });

    const approveResourceServer = userPool.addResourceServer(`factory-rs`, {
      identifier: `factory-rs`,
      scopes: [playScope, approveScope],
      userPoolResourceServerName: `factory-rs`,
    });

    const clientReadWriteAttributes =
      new ClientAttributes().withCustomAttributes(
        'custom:organization_ids',
        'custom:group_ids'
      );

    this.userPoolAddClient(
      userPool,
      [
        OAuthScope.OPENID,
        OAuthScope.PROFILE,
        OAuthScope.resourceServer(approveResourceServer, playScope),
        OAuthScope.resourceServer(approveResourceServer, approveScope),
      ],
      clientReadWriteAttributes,
      clientReadWriteAttributes
    );

    userPool.addDomain('CognitoAdminDomain', {
      cognitoDomain: {
        domainPrefix: `factory-admin-${this.envName}`,
      },
    });

    this.authorizer = new CognitoUserPoolsAuthorizer(
      this.scope,
      'factory-cognito-userpool-authorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: `factory-authorizer-${this.envName}`,
        identitySource: IdentitySource.header('Authorization'),
      }
    );

    return this;
  }

  private createUserPool(
    tokenGenerator: IFunction,
    customMessageHandler: IFunction
  ) {
    return new UserPool(this.scope, `factory-userpool-admin-${this.envName}`, {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      mfa: Mfa.OFF,
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireSymbols: true,
        requireUppercase: true,
        requireLowercase: true,
      },
      selfSignUpEnabled: false,
      signInAliases: { username: true },
      customAttributes: {
        organization_ids: new StringAttribute({ mutable: true, minLen: 1 }),
        group_ids: new StringAttribute({ mutable: true }),
      },
      lambdaTriggers: {
        preTokenGeneration: tokenGenerator,
        customMessage: customMessageHandler,
      },
    });
  }

  private userPoolAddClient(
    pool: UserPool,
    scopes: OAuthScope[],
    readAttributes?: ClientAttributes,
    writeAttributes?: ClientAttributes
  ) {
    // ClientId used in remote environments
    this.clientIdMap.default = pool.addClient('factory-userpool-app-client', {
      accessTokenValidity: Duration.hours(24),
      authFlows: {
        userPassword: true,
      },
      generateSecret: true,
      idTokenValidity: Duration.hours(24),
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: scopes,
        callbackUrls: this.params.callbackUrls,
        logoutUrls: this.params.logoutUrls,
      },
      refreshTokenValidity: Duration.days(30),
      readAttributes,
      writeAttributes,
    }).userPoolClientId;

    // ClientId used in local environment
    this.clientIdMap.local = pool.addClient(
      'factory-userpool-app-client-local',
      {
        accessTokenValidity: Duration.hours(24),
        authFlows: {
          userPassword: true,
        },
        generateSecret: true,
        idTokenValidity: Duration.hours(24),
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: false,
          },
          scopes: scopes,
          callbackUrls: [
            `http://localhost:3000/${this.formLocalAuthPathFrom(
              this.authPath
            )}`,
          ],
          logoutUrls: [`http://localhost:3000/${this.appName}`],
        },
        refreshTokenValidity: Duration.days(30),
        readAttributes,
        writeAttributes,
      }
    ).userPoolClientId;
  }

  formLocalAuthPathFrom(authPath: string) {
    const appName = authPath.substring(0, authPath.lastIndexOf('-'));
    return `${appName}-local`;
  }

  getAuthorizer() {
    return this.authorizer;
  }

  getClientIdMap() {
    return this.clientIdMap;
  }

  getPoolId() {
    return this.poolId;
  }

  getCognitoClientSecret() {
    const clientId = this.getClientIdMap().default;
    const describeCognitoUserPoolClient = new AwsCustomResource(
      this,
      'DescribeCognitoUserPoolClient',
      {
        resourceType: 'Custom::DescribeCognitoUserPoolClient',
        onCreate: {
          service: 'CognitoIdentityServiceProvider',
          action: 'describeUserPoolClient',
          parameters: {
            UserPoolId: this.poolId,
            ClientId: clientId,
          },
          physicalResourceId: PhysicalResourceId.of(clientId),
        },
        // TODO: can we restrict this policy more?
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );

    return describeCognitoUserPoolClient.getResponseField(
      'UserPoolClient.ClientSecret'
    );
  }

  getCognitoClientSecretLocal() {
    const clientId = this.getClientIdMap().local;
    const describeCognitoUserPoolClient = new AwsCustomResource(
      this,
      'DescribeCognitoUserPoolClientLocal',
      {
        resourceType: 'Custom::DescribeCognitoUserPoolClient',
        onCreate: {
          service: 'CognitoIdentityServiceProvider',
          action: 'describeUserPoolClient',
          parameters: {
            UserPoolId: this.poolId,
            ClientId: clientId,
          },
          physicalResourceId: PhysicalResourceId.of(clientId),
        },
        // TODO: can we restrict this policy more?
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );

    return describeCognitoUserPoolClient.getResponseField(
      'UserPoolClient.ClientSecret'
    );
  }
}

interface EnvParams {
  callbackUrls: string[];
  logoutUrls: string[];
}
