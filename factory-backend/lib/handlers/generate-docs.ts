import { CfnDocumentationPart } from '@aws-cdk/aws-apigateway';
import { Construct } from '@aws-cdk/core';
import { ApiGatewayHelper } from '../helpers/apigw-helper';

export function generateApiDocForMethod(
  construct: Construct,
  path: string,
  method: string,
  api: ApiGatewayHelper,
  successResponse: Record<string, any> = {},
  requestBody?: Record<string, any>,
  responseBody?: Record<string, any>
) {
  new CfnDocumentationPart(construct, `${path}-${method}-doc-body`, {
    location: {
      type: 'METHOD',
      method: method,
      path: path,
    },
    properties: JSON.stringify({
      status: 'succesful',
      code: 200,
      message: `${method} was succesful`,
      ...successResponse,
    }),
    restApiId: api.api.restApiId,
  });

  if (requestBody) {
    new CfnDocumentationPart(construct, `${path}-${method}-request-body`, {
      location: {
        type: 'REQUEST_BODY',
        method: method,
        path: path,
      },
      properties: JSON.stringify(requestBody),
      restApiId: api.api.restApiId,
    });
  }

  if (responseBody) {
    new CfnDocumentationPart(construct, `${path}-${method}-response-body`, {
      location: {
        type: 'RESPONSE_BODY',
        method: method,
        path: path,
      },
      properties: JSON.stringify(responseBody),
      restApiId: api.api.restApiId,
    });
  }
}
