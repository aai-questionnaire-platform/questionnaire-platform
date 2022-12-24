import {
  CfnDocumentationPart,
  MethodOptions,
  RequestValidator,
} from '@aws-cdk/aws-apigateway';
import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';
import { ModelRegister } from '../helpers/model-register';
import { AuthType } from '../helpers/types';
import { commonResponses } from './responses';
import { EnvParams } from '../questionnaire-factory-backend';

const QUESTIONNAIRE_API_ENDPOINT = 'organizations';

export function createOrganizationsHandler(
  scope: Construct,
  importedBucket: s3.IBucket,
  apiHelper: ApiGatewayHelper,
  register: ModelRegister,
  envParams: EnvParams,
  dependenciesLayer: LayerVersion,
  codeLayer: LayerVersion
) {
  const getOrganizationsHandler = new NodejsFunction(
    scope,
    'List of organizations supported by MMK Ripari',
    {
      runtime: Runtime.NODEJS_14_X,
      entry: 'src/handlers/get-organizations.ts',
      handler: 'getOrganizations',
      memorySize: 128,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk', 'dependencies'],
      },
      layers: [dependenciesLayer, codeLayer],
      environment: {
        ASSETS_BUCKET_NAME: importedBucket.bucketName,
      },
    }
  );

  const method = 'GET';

  getOrganizationsHandler.grantInvoke(
    new ServicePrincipal('apigateway.amazonaws.com')
  );

  //Grant permissions to bucket
  importedBucket.grantReadWrite(getOrganizationsHandler);

  //Create method documention
  if (envParams.GENERATEAPIDOC === 'true') {
    generateGetOrganizationsAPIdocs(
      scope,
      QUESTIONNAIRE_API_ENDPOINT,
      method,
      apiHelper
    );
  }

  const validator = new RequestValidator(
    scope,
    'FactoryGetOrganizationsValidator',
    {
      requestValidatorName: `FactoryGetOrganizationsValidator-${envParams.ENV_NAME}`,
      restApi: apiHelper.api,
      validateRequestBody: false,
      validateRequestParameters: true,
    }
  );

  const endPointParameters: MethodOptions = {
    requestValidator: validator,
    requestParameters: { 'method.request.querystring.locale': true },
    methodResponses: commonResponses(register, 'GetOrganizations'),
  };

  // register to player API
  apiHelper.addMethodIntegration(
    method,
    QUESTIONNAIRE_API_ENDPOINT,
    getOrganizationsHandler,
    { type: AuthType.JWT },
    endPointParameters
  );

  // register to group admin API
  apiHelper.addMethodIntegration(
    method,
    `groupadmin/${QUESTIONNAIRE_API_ENDPOINT}`,
    getOrganizationsHandler,
    { type: AuthType.COGNITO },
    endPointParameters
  );

  // register to admin API
  apiHelper.addMethodIntegration(
    method,
    `admin/${QUESTIONNAIRE_API_ENDPOINT}`,
    getOrganizationsHandler,
    { type: AuthType.API_KEY },
    endPointParameters
  );
}

function generateGetOrganizationsAPIdocs(
  construct: Construct,
  path: string,
  method: string,
  api: ApiGatewayHelper
) {
  new CfnDocumentationPart(construct, path + '-' + method + '-doc-method', {
    location: {
      type: 'METHOD',
      method: method,
      path: path,
    },
    properties: JSON.stringify({
      status: 'succesful',
      code: 200,
      message: method + ' was succesful',
      description: 'Organization structure',
    }),
    restApiId: api.api.restApiId,
  });

  //Create method parameter documentation
  new CfnDocumentationPart(
    construct,
    path + '-' + method + 'user_id' + '-doc-body',
    {
      location: {
        type: 'QUERY_PARAMETER',
        method: method,
        path: path,
        name: 'locale',
      },
      properties: JSON.stringify({ description: 'Desired output language' }),
      restApiId: api.api.restApiId,
    }
  );

  //Create method parameter documentation
  new CfnDocumentationPart(construct, path + '-' + method + '-doc-body', {
    location: {
      type: 'RESPONSE_BODY',
      method: method,
      path: path,
    },
    properties: JSON.stringify({ description: 'Organization structure' }),
    restApiId: api.api.restApiId,
  });
}
