import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getNewGroupRequestModelOptions(): ModelOptions {
  return {
    schema: require('./newgrouprequest.json'),
    contentType: 'application/json',
    description: 'Request for generating a new group',
    modelName: 'NewGroupRequest',
  };
}
