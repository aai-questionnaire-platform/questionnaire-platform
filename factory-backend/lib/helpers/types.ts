export enum AuthorizationScopes {
  PLAY = 'mmk-rs/questionnaire:play',
  APPROVE = 'mmk-rs/questionnaire:approve',
}

export enum AuthType {
  JWT = 'JWT',
  PROFILEAPI_JWT = 'PROFILEAPI_JWT',
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

interface ProfileApiJWTAuthorization {
  type: AuthType.PROFILEAPI_JWT;
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
  | ProfileApiJWTAuthorization
  | CognitoAuthorization
  | ApiKeyAuthorizationOptions
  | NoAuthorizationOptions;
