import * as path from 'path';
import { execSync } from 'child_process';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  dbSecret: secretsmanager.ISecret;
  dbHost: string;
  dbPort: string;
  dbName: string;
}

export class LambdaStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const monorepoRoot = path.join(__dirname, '../../..');
    const appDir = path.join(monorepoRoot, 'apps/product-service');
    const buildScript = path.join(__dirname, '../scripts/build-lambda.mjs');
    const tsconfig = path.join(appDir, 'tsconfig.json');

    // esbuild + @anatine/esbuild-decorators: single tree-shaken bundle that
    // preserves emitDecoratorMetadata for NestJS DI. Avoids packaging all
    // node_modules (which exceeds Lambda's 250 MB unzipped limit).
    const code = lambda.Code.fromAsset(appDir, {
      // Hash the bundler output, not the source dir. Prevents CDK from reusing
      // a stale large S3 asset when the bundling strategy changes.
      assetHashType: cdk.AssetHashType.OUTPUT,
      bundling: {
        image: cdk.DockerImage.fromRegistry('node:22-alpine'),
        local: {
          tryBundle(outputDir: string): boolean {
            try {
              const outfile = path.join(outputDir, 'lambda.js');
              execSync(
                `node "${buildScript}" "${path.join(appDir, 'src/lambda.ts')}" "${outfile}" "${tsconfig}"`,
                { cwd: monorepoRoot, stdio: 'inherit' },
              );
              return true;
            } catch {
              return false;
            }
          },
        },
      },
    });

    this.lambdaFunction = new lambda.Function(this, 'Handler', {
      handler: 'lambda.lambdaHandler',
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.lambdaSecurityGroup],
      environment: {
        NODE_ENV: 'production',
        SWAGGER_ENABLED: 'true',
        DB_HOST: props.dbHost,
        DB_PORT: props.dbPort,
        DB_NAME: props.dbName,
        DB_SECRET_ARN: props.dbSecret.secretArn,
      },
      code,
    });

    props.dbSecret.grantRead(this.lambdaFunction);
  }
}
