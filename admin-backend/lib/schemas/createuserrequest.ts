import { ModelOptions } from '@aws-cdk/aws-apigateway';

export function getCreateUserRequestModelOptions(): ModelOptions {
  return {
    schema: require('./createuserrequest.json'),
    contentType: 'application/json',
    description: 'Request for generating a new user',
    modelName: 'CreateUserRequest',
  };
}
