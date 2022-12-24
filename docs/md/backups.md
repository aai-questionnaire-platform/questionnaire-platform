# Backups

Aws Backup service is used for making scheduled backups. Resources are selected by tagging at account level, so that all
resources supported by AWS backup service that are tagged with key: 'backup' value: 'daily' are included in the backup.

Backups have to be ***separately enabled***, see below for instructions.

## Setting up the account

Aws account whose resources are backed up needs some setup manually done from Aws web console (https://console.aws.amazon.com).

- ***First***, the IAM service role that has the necessary permissions for backup creation and restore has to be made from the web console. This role is automatically made as a side product when a backup is created from web console. To create the IAM role, follow instructions at Aws backup developer guide, [external link to section](https://docs.aws.amazon.com/aws-backup/latest/devguide/iam-service-roles.html#creating-default-service-role). 
- ***Second***, all resource types that need backups must be enabled from AWS Backup -> Settings -> Resource type list. By default, the protected resources include DynamoDB tables and S3 buckets. Select them the list:  
[AWS Backup service selection image](../img/backup/service_selection.png)
- ***Third***, backing up S3 buckets need some additional permissions. Follow the instructions at Aws backup developer guide, [external link to section](https://docs.aws.amazon.com/aws-backup/latest/devguide/s3-backups.html#one-time-permissions-setup). After which, the AWSBackupDefaultServiceRole in IAM console should look like this:  
[AWS IAM role permission policies image](../img/backup/iam_permission_policies.png)

## Setting the scheduled backups

Note that you must have working AWS credentials setup. See other parts of the documentation.

***Factory-infra*** -stack contains setting up account-wide backups for resources with backup - daily tags.
1. Enable backup tags in factory-infra instance you are going to use. To do this, add ```enableBackups: true``` to your stack instance's configuration in lib/questionnaire-factory-infra-stack.ts file. 
1. Deploy stack: ```deploy-stack.sh -e [environment]```
1. In the Factory-infra repository, install script  
```cd scripts/setup-scheduled-backups && npm install```  
Then run the script:     
```node scripts/setup-scheduled-backups/setup-scheduled-backups.js -e <webiny env>```  
Where <webiny-env> is for example dev,test or prod.  
* The script does the following:
  - Sets up scheduled backups for (aws backup supported) resources with backup - daily tag. 
  - Tags Webiny table with backup tag.
  - Creates AWS account specific backup bucket, where resources that need to be backed up can be placed. For exampe, cognito users and groups are stored here for backups.
* The following resources are backed up:
  - ***DynamoDB tables*** that are created in factory-infra stack. These are backed up nighly with AWS Backup service.
  - ***Assets bucket***. This is backed up nighly with AWS Backup service.
  - ***Webiny DynamoDB table***. This is backed up nighly with AWS Backup service.
  - ***Cognito users and groups***. These are backed up nightly by running cognito-backup -tool [(External link)](https://github.com/mifi/cognito-backup) tool nightly from lambda and copying the user data and groups to a s3 bucket. 

***Enable backup tags in factory-backend*** instance you are going to use. To do this, add ```COGNITOBACKUPS: 'true'``` to your stack instance's configuration in lib/questionnaire-factory-backend.ts file.


Default schedule for backups are Cognito -> S3 at 01:15 UTC and DynamoDB tables and S3 bucket at 3:05 UTC.

## Monitoring and Restoring backups

### DynamoDB tables, S3 assets

In general, up-to-date instructions for monitoring and using the backups are in AWS documentation [External link](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html). When the backups are enabled, you can monitor them from AWS web console [External link](https://eu-west-1.console.aws.amazon.com/backup/). Backups are stored in Questionnaire_Backups vault, as shown below.  
[AWS Backup vault image](../img/backup/vault.png)  
From there, the backups can be browsed and restored. In general, the backups are restored to empty resource, such as DynamoDB table or S3 bucket.

### Cognito users

Cognito users are restored by copying the user and group file from S3 bucket to local workstation, and restoring the backup using cognito-backup tool - [External link](https://github.com/mifi/cognito-backup). See the instructions for up-to-date usage.

## Considerations

Setup for backup schedules and items are thought to be alright for most use cases, but however the schedules and strategies should be considered for each use case individually.

