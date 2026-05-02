import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecrassets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';

export interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ecsSecurityGroup: ec2.SecurityGroup;
  albSecurityGroup: ec2.SecurityGroup;
  dbSecret: secretsmanager.ISecret;
  dbHost: string;
  dbPort: string;
  dbName: string;
}

export class EcsStack extends cdk.Stack {
  public readonly internalAlbListener: elbv2.IApplicationListener;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // Monorepo root is 3 levels up from infra/cdk/lib/
    // exclude prevents CDK's asset staging from recursively including cdk.out/
    const dockerImage = new ecrassets.DockerImageAsset(this, 'ProductServiceImage', {
      directory: path.join(__dirname, '../../..'),
      file: 'apps/product-service/Dockerfile',
      platform: ecrassets.Platform.LINUX_AMD64,
      exclude: [
        '**/node_modules',
        '**/cdk.out',
        '**/dist',
        '**/coverage',
        '**/.git',
        'infra',
        'packages',
        '.turbo',
        '**/*.md',
      ],
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: 'product-service-cluster',
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    const logGroup = new logs.LogGroup(this, 'AppLogGroup', {
      logGroupName: '/ecs/product-service',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    props.dbSecret.grantRead(taskDefinition.taskRole);

    taskDefinition.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'product-service',
        logGroup,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        DB_HOST: props.dbHost,
        DB_PORT: props.dbPort,
        DB_NAME: props.dbName,
      },
      secrets: {
        DB_USER: ecs.Secret.fromSecretsManager(props.dbSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(props.dbSecret, 'password'),
      },
      portMappings: [{ containerPort: 3000, protocol: ecs.Protocol.TCP }],
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      securityGroups: [props.ecsSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      assignPublicIp: false,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'InternalAlb', {
      vpc: props.vpc,
      internetFacing: false,
      securityGroup: props.albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc: props.vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/products',
        interval: cdk.Duration.seconds(30),
        healthyHttpCodes: '200',
      },
    });

    this.internalAlbListener = alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup],
    });

    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'Internal ALB DNS name (diagnostics only — not publicly accessible)',
    });
  }
}
