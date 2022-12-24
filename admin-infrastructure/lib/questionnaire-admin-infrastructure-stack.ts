//vpc-stack.ts
import { CfnOutput, Stack, StackProps, Construct } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Runtime } from "@aws-cdk/aws-lambda";
import { ApiGatewayHelper } from "./apigw-helper";
import { CognitoHelper } from "./cognito-helper";
import { FrontendHelper } from "./frontend-helper";

export class QuestionnaireAdminInfrastructureStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envName: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const frontendHelper = new FrontendHelper(
      this,
      "admin-frontend",
      envName
    );
    const distribution = frontendHelper.getDistribution()
    const loginUrl = frontendHelper.getLoginUrl();

    const preSignupHandler = new NodejsFunction(
      this,
      "Pre-signup handler for Cognito",
      {
        runtime: Runtime.NODEJS_14_X,
        entry: "src/handlers/pre-signup.ts",
        handler: "preSignupHandler",
        memorySize: 128,
        bundling: {
          minify: true,
          externalModules: ["aws-sdk", "dependencies"],
        },
      }
    );

    //Create user pool authorizer
    const userPoolAuthorizer = new CognitoHelper(
      this,
      "admin-cognito-authorizer",
      envName,
      preSignupHandler
    );

    //Create api gw helper
    const apiHelper = new ApiGatewayHelper(
      this,
      "questionnaire-admin-api",
      `Questionnaire Admin API - ${envName}`,
      userPoolAuthorizer.getAuthorizer()
    );

    const resourceId = apiHelper.getRootResource();

    apiHelper.deployToStage(this, envName);

    // Output values
    new CfnOutput(this, "questionnaire-admin-api-id-" + envName, {
      exportName: "QuestionnaireAdminApiId-" + envName,
      value: apiHelper.getApi().restApiId,
    });
    new CfnOutput(this, "questionnaire-admin-api-root-resource-" + envName, {
      exportName: "QuestionnaireAdminApiRootResource-" + envName,
      value: resourceId,
    });
    new CfnOutput(this, "admin-cognito-authorizer-" + envName, {
      exportName: "AdminCognitoAuthorizer-" + envName,
      value: userPoolAuthorizer.getAuthorizer().authorizerId,
    });
    new CfnOutput(this, "admin-cognito-authorizer-url-" + envName, {
      value:
        "https://admincms-" +
        envName +
        ".auth." +
        Stack.of(this).region +
        ".amazoncognito.com/login",
      exportName: "AdminCognitoAuthorizerUrl-" + envName,
    });
    new CfnOutput(this, "admin-cognito-authorizer-client-" + envName, {
      value: userPoolAuthorizer.getClientIdList()[0],
      exportName: "AdminCognitoAuthorizerClient-" + envName,
    });
    new CfnOutput(this, "admin-cognito-authorizer-local-client-" + envName, {
      value: userPoolAuthorizer.getClientIdList()[1],
      exportName: "AdminCognitoAuthorizerLocalClient-" + envName,
    });

    new CfnOutput(this, "cognito-admin-userpool-id-" + envName, {
      value: userPoolAuthorizer.getUserPoolId(),
      exportName: "CognitoAdminUserpoolId-" + envName,
    });

    new CfnOutput(this, "questionnaire-admin-api-url-" + envName, {
      value:
        "https://" +
        apiHelper.getApi().restApiId +
        ".execute-api." +
        Stack.of(this).region +
        ".amazonaws.com/" +
        envName,
      exportName: "QuestionnaireAdminApiUrl-" + envName,
    });
    new CfnOutput(this, "questionnaire-admin-cloudfront-url-" + envName, {
      value: "https://" + distribution.distributionDomainName,
      exportName: "QuestionnaireAdminCloudFrontUrl-" + envName,
    });
    new CfnOutput(this, "questionnaire-admin-login-url-" + envName, {
      value: "https://" + loginUrl,
      exportName:  "QuestionnaireAdminLoginUrl-" + envName
    });
  }
}
