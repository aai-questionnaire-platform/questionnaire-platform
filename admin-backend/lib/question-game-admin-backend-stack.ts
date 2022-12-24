import { LayerVersion, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Construct, Stack } from '@aws-cdk/core';
import { SecretsService } from '../src/services/secrets-service';
import { createWebinyRedirectHandlers } from './handlers/webiny-redirect-handler';
import { ApiGatewayHelper } from './helpers/api-gw-helper';
import { ModelRegister } from './helpers/model-register';
import { Fn } from '@aws-cdk/core';
import {
  Role,
  Effect,
  PolicyStatement,
  ServicePrincipal,
  ManagedPolicy,
} from '@aws-cdk/aws-iam';
import {
  createGetUsersHandler,
  createPostUserHandler,
} from './handlers/user-handlers';
import { GameInstance } from '../src/datamodels/game-instance';

export class QuestionGameAdminBackendStack extends Stack {
  private env: string;
  //Register of api gw models
  private register = new ModelRegister();

  constructor(scope: Construct, id: string, env: string) {
    super(scope, id);
    this.env = env;
  }

  generate() {
    this.generateApi();
  }

  private generateApi() {
    const apiHelper = new ApiGatewayHelper(
      this,
      `QuestionnaireAdminApi-${this.env}`,
      `QuestionnaireAdminApiId-${this.env}`,
      `QuestionnaireAdminApiRootResource-${this.env}`,
      `AdminCognitoAuthorizer-${this.env}`
    );

    //Register models
    this.register.registerModels(this, apiHelper.api);

    const secretService = new SecretsService();

    const webinyToken = secretService.getWebinyToken(this, this.env);
    const webinyEndpoint = this.node.tryGetContext(
      `webiny-endpoint-${this.env}`
    );

    const useFactory = true; // Change this if you want to use old ripari-backend

    let factoryInstanceProperties;
    if (useFactory) {
      const factoryInstances = this.node.tryGetContext(
        'questionnaire-factory-instances'
      );
      console.log(
        `properties for env ${this.env}:`,
        JSON.stringify(factoryInstances[this.env])
      );

      let envFactoryInstances = factoryInstances[this.env];
      if (!envFactoryInstances) {
        console.warn(
          `Missing properties for env ${this.env}, pleas check README.md and edit cdk.json, using dev`
        );
        envFactoryInstances = factoryInstances['dev'];
      }

      factoryInstanceProperties = envFactoryInstances.map((instance: any) => {
        const gameBackendEnv = instance.factoryEnv;
        return <GameInstance>{
          gameUuid: instance.gameUuid,
          gameApiToken: `<apikey>${secretService
            .getFactoryGameApiKey(this, gameBackendEnv)
            .secretValue.toString()}</apikey>`,
          gameApiEndpoint: Fn.importValue(
            `FactoryRestApiUrl-${gameBackendEnv}`
          ),
          gameAdminUserPoolId: Fn.importValue(
            `FactoryCognitoUserpoolAdminId-${gameBackendEnv}`
          ),
        };
      });
    } else {
      const ripariGameInstance = <GameInstance>{
        gameUuid: '?',
        gameApiToken: secretService
          .getGameApiKey(this, this.env)
          .secretValue.toString(),
        gameApiEndpoint: Fn.importValue(`QuestionnaireRestApiUrl-${this.env}`),
        gameAdminUserPoolId: Fn.importValue(
          `CognitoUserpoolAdminId-${this.env}`
        ),
      };
      factoryInstanceProperties = [ripariGameInstance];
    }

    const adminUserPoolId = Fn.importValue(
      `CognitoAdminUserpoolId-${this.env}`
    );
    //Policy&role for using cognito userpool
    const cognitoAdminManagedPolicy = new ManagedPolicy(
      this,
      `MMKAdminCognitoManagedPolicy-${this.env}`,
      {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
              'cognito-idp:AdminCreateUser',
              'cognito-idp:AdminUpdateUserAttributes',
              'cognito-idp:ListUsers',
              'cognito-idp:AdminGetUser',
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
            ],
            resources: ['*'],
          }),
        ],
      }
    );
    const cognitoAdminRole = new Role(
      this,
      `MMKAdminCognitoCustomRoleId-${this.env}`,
      {
        roleName: `MMKAdminCognitoCustomRole-${this.env}`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [cognitoAdminManagedPolicy],
      }
    );

    // Create POST redirect handlers
    createWebinyRedirectHandlers(
      this,
      apiHelper,
      webinyToken.secretValue.toString(),
      webinyEndpoint,
      factoryInstanceProperties,
      cognitoAdminRole,
      adminUserPoolId
    );

    //Create layers for code and deps (should webiny-redirethandlers have these too?)
    const depLayer = new LayerVersion(
      this,
      'mmkQuestionnaireAdminDependenciesLayer',
      {
        code: Code.fromAsset('./src/node_modules/'),
        compatibleRuntimes: [Runtime.NODEJS_14_X],
        description: 'External modules layer',
      }
    );

    const codeLayer = new LayerVersion(this, 'mmkQuestionnaireAdminCodeLayer', {
      code: Code.fromAsset('./src/'),
      compatibleRuntimes: [Runtime.NODEJS_14_X],
      description: 'Code layer',
    });

    createGetUsersHandler(
      this,
      apiHelper,
      cognitoAdminRole,
      adminUserPoolId,
      [depLayer, codeLayer],
      factoryInstanceProperties
    );

    createPostUserHandler(
      this,
      apiHelper,
      cognitoAdminRole,
      adminUserPoolId,
      this.register,
      [depLayer, codeLayer],
      factoryInstanceProperties
    );

    apiHelper.deployToStage(this, this.env);
  }
}
