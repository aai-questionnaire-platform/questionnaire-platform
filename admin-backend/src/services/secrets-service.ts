import { ISecret, Secret } from '@aws-cdk/aws-secretsmanager';
import { Construct, Fn } from '@aws-cdk/core';

export class SecretsService {
  getFactoryGameApiKey(scope: Construct, envName: string): ISecret {
    const keyName = `FactoryQuestionnaireApiKey-${envName}`;
    return Secret.fromSecretNameV2(
      scope,
      `ApiKeySecretFromName-${envName}`,
      keyName
    );
  }

  getGameApiKey(scope: Construct, envName: string) {
    return SecretsService.getApiKeySecretByName(
      `ApiKeySecretArn-${envName}`,
      scope,
      envName
    );
  }

  /**
   * Fetches the secret from secret manager. There are separate Webiny installations for dev,
   * test and prod environments. All the developer stacks use by default the dev installation of Webiny.
   * @param scope stack
   * @param envName suffix of the environment
   */
  getWebinyToken(scope: Construct, envName: string) {
    return Secret.fromSecretNameV2(
      scope,
      'webinyToken-' + envName,
      'webiny-token-' + envName
    );
  }

  private static getApiKeySecretByName(
    secretArnOrName: string,
    scope: Construct,
    envName: string
  ) {
    return Secret.fromSecretAttributes(scope, `api-key-${envName}`, {
      secretArn: Fn.importValue(secretArnOrName),
    });
  }
}
