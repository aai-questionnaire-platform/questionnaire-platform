import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getProgressModelOptions(): ModelOptions {
  return {
    schema: require('./progress.json'),
    contentType: 'application/json',
    description: 'Progess',
    modelName: 'Progress',
  };
}
