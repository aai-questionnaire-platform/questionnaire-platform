import { execSync } from 'child_process';
import * as fs from 'fs';
import { putToBucket } from '../aws-wrappers/put-file-to-bucket';
import { doesExist } from '../aws-wrappers/read-file-from-bucket';

export class BackupService {

  constructor(public userPoolId: string) {}
  /**
   * Copy users and groups from user pool to S3 bucket for backups.
   * @param accountId
   */
  async copyUserPoolToS3(accountId: string) {
    const bucketName = `questionnairebackup-${accountId}`;
    const bucketExists = await doesExist(bucketName);
    if (bucketExists) {
      console.info(`Copying user and group data from ${this.userPoolId} to ${bucketName}`);
      const users = this.getUsers(this.userPoolId);
      const groups = this.getGroups(this.userPoolId);
      const locale = 'fi-FI';
      await putToBucket(
        bucketName,
        `${bucketName}-users.json`,
        users,
        locale,
        false
      );
      await putToBucket(
        bucketName,
        `${bucketName}-groups.json`,
        groups,
        locale,
        false
      );
    } else {
      console.error(`Bucket ${bucketName} not available, skipping copying user pool data.`);
    }
  }

  private getUsers(userpool: string): string {
    const cognitoBackup = execSync(
     `node /opt/node_modules/cognito-backup/cli.js backup-users ${userpool} --file /tmp/${userpool}-users.json`,
     {stdio: 'inherit'}
    );
    return fs.readFileSync(`/tmp/${userpool}-users.json`).toString();
  }

  private getGroups(userpool: string): string {
    const cognitoBackup = execSync(
      `node /opt/node_modules/cognito-backup/cli.js backup-groups ${userpool} --file /tmp/${userpool}-groups.json`,
      {stdio: 'inherit'}
    );
    return fs.readFileSync(`/tmp/${userpool}-groups.json`).toString();
  }
}
