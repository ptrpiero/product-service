#!/usr/bin/env tsx
import { execSync } from 'child_process';

const STACK = 'ProductServiceFrontendStack';
const REGION = 'eu-west-1';
const DIST_PATH = 'apps/dashboard/dist/dashboard/browser';

function cfnOutput(key: string): string {
  const value = execSync(
    `aws cloudformation describe-stacks --stack-name ${STACK} --region ${REGION}` +
      ` --query 'Stacks[0].Outputs[?OutputKey==\`${key}\`].OutputValue' --output text`,
    { encoding: 'utf8' },
  ).trim();
  if (!value) throw new Error(`CloudFormation output '${key}' not found in ${STACK}`);
  return value;
}

function run(cmd: string): void {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

run('pnpm --filter @product-service/dashboard build');

const bucket = cfnOutput('BucketName');
const distId = cfnOutput('DistributionId');

run(`aws s3 sync ${DIST_PATH}/ s3://${bucket} --delete`);
run(`aws cloudfront create-invalidation --distribution-id ${distId} --paths '/*'`);

console.log('\nDeploy complete.');
