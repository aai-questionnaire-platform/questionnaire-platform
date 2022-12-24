import {
  Stack,
  StackProps,
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_route53_targets as route53_targets,
  aws_s3 as s3,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class DashboardAdminFrontendStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    envName: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const params: EnvParams = {
      hostedZoneId: "hostedZoneId",
      zoneName: "yourdomain.fi",
      publicCertRef: "arn:aws:acm:us-east-1:ACCOUNTID:certificate/CERTID",
    };

    const domainNames = [`dashboard-admin-${envName}.yourdomain.fi`];

    const dfBucket = new s3.Bucket(
      this,
      "dashboard-admin-frontend-" + envName,
      {
        bucketName: "dashboard-admin-frontend-" + envName,
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        publicReadAccess: true,
      }
    );

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      `${id}-${params.zoneName}-Certificate`,
      params.publicCertRef
    );
    const cfDistribution = new cloudfront.Distribution(
      this,
      `${id}-cloudfront`,
      {
        domainNames: domainNames,
        defaultBehavior: {
          origin: new origins.S3Origin(dfBucket),
        },
        certificate: certificate,
      }
    );

    const route53Target = route53.RecordTarget.fromAlias(
      new route53_targets.CloudFrontTarget(cfDistribution)
    );
    const dfHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "DFHostedZone",
      {
        hostedZoneId: params.hostedZoneId,
        zoneName: params.zoneName,
      }
    );

    domainNames.forEach((recordName) => {
      new route53.ARecord(this, `DFAlias-${recordName}`, {
        target: route53Target,
        zone: dfHostedZone,
        recordName: recordName,
      });
    });
  }
}

interface EnvParams {
  hostedZoneId: string;
  zoneName: string;
  publicCertRef: string;
}
