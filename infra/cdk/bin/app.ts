#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { EcsStack } from '../lib/ecs-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const networkStack = new NetworkStack(app, 'ProductServiceNetworkStack', { env });

const databaseStack = new DatabaseStack(app, 'ProductServiceDatabaseStack', {
  env,
  vpc: networkStack.vpc,
  dbSecurityGroup: networkStack.dbSecurityGroup,
});

const ecsStack = new EcsStack(app, 'ProductServiceEcsStack', {
  env,
  vpc: networkStack.vpc,
  ecsSecurityGroup: networkStack.ecsSecurityGroup,
  albSecurityGroup: networkStack.albSecurityGroup,
  dbSecret: databaseStack.dbSecret,
  dbHost: databaseStack.dbHost,
  dbPort: databaseStack.dbPort,
  dbName: databaseStack.dbName,
});

new ApiGatewayStack(app, 'ProductServiceApiGatewayStack', {
  env,
  vpc: networkStack.vpc,
  internalAlbListener: ecsStack.internalAlbListener,
});
