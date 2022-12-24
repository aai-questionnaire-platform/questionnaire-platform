#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { OrderInfraStack } from '../lib/order-infra-stack';

const app = new cdk.App();

new OrderInfraStack(app, 'OrderInfraStack-dev', 'dev');
