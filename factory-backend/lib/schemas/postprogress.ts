import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getPostProgressModelOptions(): ModelOptions {
  return {
    schema: require('./postprogress.json'),
    contentType: 'application/json',
    description: 'PostProgess',
    modelName: 'PostProgess',
  };
}
