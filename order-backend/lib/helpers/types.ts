export enum AuthorizationScopes {
  PLAY = 'REMOVED',
  APPROVE = 'REMOVED',
}

export enum AuthType {
  JWT = 'JWT',
  COGNITO = 'COGNITO',
  API_KEY = 'API_KEY',
  NONE = 'NONE',
}

interface CognitoAuthorization {
  type: AuthType.COGNITO;
  authorizationScopes?: string[];
}

interface JWTAuthorization {
  type: AuthType.JWT;
  authorizationScopes?: never;
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
  | JWTAuthorization
  | CognitoAuthorization
  | ApiKeyAuthorizationOptions
  | NoAuthorizationOptions;
