import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getPostOrderBodyModel(): ModelOptions {
  return {
    schema: require('./post-order-body.json'),
    contentType: 'application/json',
    description: 'Body for POST /order',
    modelName: 'PostOrderBody',
  };
}
