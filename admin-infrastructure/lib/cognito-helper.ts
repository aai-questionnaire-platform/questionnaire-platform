import * as cdk from "@aws-cdk/core";
import {
  CognitoUserPoolsAuthorizer,
  IdentitySource,
} from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import {
  AccountRecovery,
  ClientAttributes,
  Mfa,
  OAuthScope,
  StringAttribute,
  UserPool,
  UserPoolOperation,
  ResourceServerScope,
  UserPoolResourceServer,
} from "@aws-cdk/aws-cognito";

enum AuthorizationScopes {
  ADMIN = "questionnaire:admin",
}

export class CognitoHelper extends cdk.Construct {
  _authorizer: CognitoUserPoolsAuthorizer;
  _clientIdList: string[] = [];
  private params: EnvParams;
  private userPoolId: string;

  constructor(
    scope: cdk.Stack,
    id: string,
    envName: string,
    preSignupLambda: lambda.IFunction
  ) {
    super(scope, id);

    const prodParams: EnvParams = {
      callbackUrls: ["https://admin.yourdomain.fi/login"],
      logoutUrls: ["https://admin.yourdomain.fi"]
    };
    const devParams: EnvParams = {
      callbackUrls: [`https://admin-${envName}.yourdomain.fi/login`],
      logoutUrls: [`https://admin-${envName}.yourdomain.fi`]
    };
    this.params = envName === "prod" ? prodParams: devParams;

    const userPool = new UserPool(scope, `mmk-admin-userpool-${envName}`, {
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
        game_ids: new StringAttribute({ mutable: true }),
      }
    });
    
    this.userPoolId = userPool.userPoolId;

    userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, preSignupLambda);

    const adminScope = new ResourceServerScope({
      scopeName: AuthorizationScopes.ADMIN,
      scopeDescription:
        "Allows administration of game-content, organizations, groups and users",
    });

    const playResourceServer = userPool.addResourceServer(`mmk-admin-rs`, {
      identifier: `mmk-admin-rs`,
      scopes: [adminScope],
      userPoolResourceServerName: `mmk-admin-rs`,
    });

    const clientReadWriteAttributes =
      new ClientAttributes().withCustomAttributes("custom:game_ids");

    this.userPoolAddClient(
      userPool,
      [
        OAuthScope.OPENID,
        OAuthScope.PROFILE,
        OAuthScope.resourceServer(playResourceServer, adminScope),
      ],
      clientReadWriteAttributes,
      clientReadWriteAttributes
    );

    userPool.addDomain("AdminCognitoDomain", {
      cognitoDomain: {
        domainPrefix: `admincms-${envName}`,
      },
    });

    this._authorizer = new CognitoUserPoolsAuthorizer(
      scope,
      "mmk-admin-cognito-userpool-authorizer",
      {
        cognitoUserPools: [userPool],
        authorizerName: `mmk-admin-authorizer-${envName}`,
        identitySource: IdentitySource.header("Authorization"),
      }
    );
  }

  playScope: ResourceServerScope;
  approveScope: ResourceServerScope;
  playResourceServer: UserPoolResourceServer;
  approveResourceServer: UserPoolResourceServer;

  userPoolAddClient(
    pool: UserPool,
    scopes: OAuthScope[],
    readAttributes?: ClientAttributes,
    writeAttributes?: ClientAttributes
  ) {
    this._clientIdList.push(
      pool.addClient("mmk-admin-userpool-app-client", {
        accessTokenValidity: cdk.Duration.hours(24),
        authFlows: {
          userPassword: true,
        },
        generateSecret: false,
        idTokenValidity: cdk.Duration.hours(24),
        oAuth: {
          flows: {
            authorizationCodeGrant: false,
            implicitCodeGrant: true,
          },
          scopes: scopes,
          callbackUrls: this.params.callbackUrls,
          logoutUrls: this.params.logoutUrls,
        },
        refreshTokenValidity: cdk.Duration.days(30),
        readAttributes,
        writeAttributes,
      }).userPoolClientId
    );

    this._clientIdList.push(
      pool.addClient("mmk-admin-userpool-app-client-local", {
        accessTokenValidity: cdk.Duration.hours(24),
        authFlows: {
          userPassword: true,
        },
        generateSecret: false,
        idTokenValidity: cdk.Duration.hours(24),
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: true,
          },
          scopes: scopes,
          callbackUrls: [`http://localhost:3000/login`],
          logoutUrls: ["http://localhost:3000"],
        },
        refreshTokenValidity: cdk.Duration.days(30),
      }).userPoolClientId
    );
  }

  getAuthorizer() {
    return this._authorizer;
  }

  getClientIdList(): string[] {
    return this._clientIdList;
  }

  getUserPoolId(): string {
    return this.userPoolId;
  }
}

interface EnvParams {
  callbackUrls: string[],
  logoutUrls: string[]
}
