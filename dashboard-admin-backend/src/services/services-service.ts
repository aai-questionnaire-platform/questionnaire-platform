import { putToBucket } from '../aws-wrappers/put-file-to-bucket';
import { readFromFile } from '../aws-wrappers/read-file-from-bucket';
import { Service } from '../types';

export async function getServices(): Promise<Service[]> {
  const bucketName = process.env.JSON_BUCKET_NAME as string;
  const servicesJsonName = process.env.SERVICES_FILE_NAME as string;
  return await readFromFile(bucketName, servicesJsonName);
}

export async function saveServices(services: Service[]) {
  // save
  const bucketName = process.env.JSON_BUCKET_NAME as string;
  const servicesJsonName = process.env.SERVICES_FILE_NAME as string;
  return await putToBucket(
    bucketName,
    servicesJsonName,
    JSON.stringify(services)
  );
}
