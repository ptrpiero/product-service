import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  dbSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbHost: string;
  public readonly dbPort: string;
  public readonly dbName: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.dbName = 'ecommerce';

    const dbInstance = new rds.DatabaseInstance(this, 'MysqlInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.dbSecurityGroup],
      databaseName: this.dbName,
      credentials: rds.Credentials.fromGeneratedSecret('app', {
        secretName: '/product-service/db/credentials',
      }),
      storageType: rds.StorageType.GP2,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      multiAz: false,
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      backupRetention: cdk.Duration.days(0),
    });

    this.dbSecret = dbInstance.secret!;
    this.dbHost = dbInstance.instanceEndpoint.hostname;
    this.dbPort = dbInstance.instanceEndpoint.port.toString();

    new cdk.CfnOutput(this, 'DbSecretArn', {
      value: this.dbSecret.secretArn,
      description: 'Secrets Manager secret ARN for DB credentials',
    });

    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: this.dbHost,
      description: 'RDS MySQL endpoint hostname',
    });
  }
}
