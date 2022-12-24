import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getErrorResponse(): ModelOptions {
  return {
    schema: require('./errorresponse.json'),
    contentType: 'application/json',
    description: 'A general error response',
    modelName: 'ErrorResponse',
  };
}
