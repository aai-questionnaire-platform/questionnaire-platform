#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DashboardAdminFrontendStack } from "../lib/dashboard-admin-frontend-stack";

const app = new cdk.App();
const region = "eu-west-1";

new DashboardAdminFrontendStack(app, "DashboardAdminFrontendStack-dev", "dev", {
  env: { region: region },
});
