import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { Stack } from "@aws-cdk/core";
import { ISecret } from "@aws-cdk/aws-secretsmanager";

export class SecretsHelper {
  /**
   * Get ApiKey from secret name if it exists.
   * @param scope
   * @param env Environment
   * @return ISecret secret
   */
  getApiKey(scope: Stack, env: string): ISecret {
    const keyName = `FactoryQuestionnaireApiKey-${env}`;
    return secretsmanager.Secret.fromSecretNameV2(scope, `ApiKeySecretFromName-${env}`, keyName);
  }
}
