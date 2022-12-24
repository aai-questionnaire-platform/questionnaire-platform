import { App } from '@aws-cdk/core';
import { QuestionGameAdminBackendStack } from './question-game-admin-backend-stack';

export class QuestionGameAdminStackGenerator {
  private app: App;

  constructor(private stackName: string) {
    this.app = new App();
  }

  generateStacks(envs: string[]) {
    envs.forEach((env) => {
      new QuestionGameAdminBackendStack(
        this.app,
        `${this.stackName}-${env}`,
        env
      ).generate();
    });
  }
}
