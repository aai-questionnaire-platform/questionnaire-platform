import { BackupService } from '../services/backup-service';

const cognitoBackup = async (event: any) => {
  try {
    const service = new BackupService(process.env.USERPOOL as string);
    await service.copyUserPoolToS3(event.account);
  } catch (error) {
    console.error('cognitoBackup error', error);
  }
};

export { cognitoBackup };
