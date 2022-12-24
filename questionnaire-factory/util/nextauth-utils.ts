import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Provider } from 'next-auth/providers';

import { AuthorizationScopes } from '@/enums';
import type {
  AAIProviderProps,
  AuroraAIProfile,
  AdminCognitoProfile,
} from '@/types/next-auth';

export function AAIProvider(id: string, props: AAIProviderProps): Provider {
  return {
    id: `auroraai-${id}`,
    name: `auroraai-${id}`,
    type: 'oauth',
    idToken: true,
    wellKnown:
      'https://auroraai.astest.suomi.fi/oauth/.well-known/openid-configuration',
    profile: playerProfileHandler,
    ...props,
  };
}

function playerProfileHandler(profile: AuroraAIProfile) {
  return {
    id: profile.sub,
    userId: profile.sub,
    aud: profile.aud,
    scope: AuthorizationScopes.PLAY,
  };
}

export function adminProfileHandler(profile: AdminCognitoProfile) {
  return {
    id: profile.sub,
    name: profile['cognito:username'],
    organizationIds: (profile.organization_ids || '').split(','),
    groupIds: (profile.group_ids || '').split(','),
    scope: AuthorizationScopes.APPROVE,
  };
}

export function createDynamoDBClient() {
  return DynamoDBDocument.from(
    new DynamoDB({
      credentials: {
        accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY!,
      },
      region: 'eu-west-1',
    }),
    {
      marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    }
  );
}
