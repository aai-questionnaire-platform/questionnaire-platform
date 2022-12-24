import { MethodResponse, Model } from '@aws-cdk/aws-apigateway';
import { ModelRegister } from '../helpers/model-register';

const commonResponseParameters = {
  'method.response.header.Content-Type': true,
  'method.response.header.Access-Control-Allow-Origin': true,
  'method.response.header.Access-Control-Allow-Credentials': true,
};

export function commonResponses(
  register: ModelRegister,
  responseModelName?: string
): MethodResponse[] {
  return [
    {
      statusCode: '200',
      responseParameters: commonResponseParameters,
      responseModels: {
        'application/json': responseModelName
          ? register.getModel(responseModelName)
          : Model.EMPTY_MODEL,
      },
    },
    {
      statusCode: '400',
      responseParameters: commonResponseParameters,
      responseModels: {
        'application/json': register.getModel('ErrorResponse'),
      },
    },
    {
      statusCode: '401',
      responseParameters: commonResponseParameters,
      responseModels: {
        'application/json': register.getModel('ErrorResponse'),
      },
    },
    {
      statusCode: '500',
      responseParameters: commonResponseParameters,
      responseModels: {
        'application/json': register.getModel('ErrorResponse'),
      },
    },
  ];
}
