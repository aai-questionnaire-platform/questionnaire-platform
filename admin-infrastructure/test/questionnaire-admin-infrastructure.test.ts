import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as QuestionnaireAdminInfrastructure from "../lib/questionnaire-admin-infrastructure-stack";

test("Stack Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack =
    new QuestionnaireAdminInfrastructure.QuestionnaireAdminInfrastructureStack(
      app,
      "MyTestStack",
      "dev"
    );
});
