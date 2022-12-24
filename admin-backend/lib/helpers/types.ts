export enum AuthorizationScopes {
  ADMIN = 'questionnaire:admin',
}

export enum AuthType {
  COGNITO = 'COGNITO',
  API_KEY = 'API_KEY',
  NONE = 'NONE',
}

interface CognitoAuthorization {
  type: AuthType.COGNITO;
  authorizationScopes: string[];
}

interface ApiKeyAuthorizationOptions {
  type: AuthType.API_KEY;
  authorizationScopes?: never;
}

interface NoAuthorizationOptions {
  type: AuthType.NONE;
  authorizationScopes?: never;
}

export type AuthorizationOptions =
  | CognitoAuthorization
  | ApiKeyAuthorizationOptions
  | NoAuthorizationOptions;
