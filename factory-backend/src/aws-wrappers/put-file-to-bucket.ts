import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function putToBucket(
  bucketName: string,
  key: string,
  content: string,
  locale: string,
  logContent: boolean = true,
) {
  let logMessage = `Publishing content to bucket ${bucketName} with filename ${key}. `;
  if (logContent) {
    logMessage = logMessage + content
  }

  console.debug(logMessage);
  try {
    //Construct the S3 client
    const s3 = new S3Client({});
    const bucketParams = {
      Bucket: bucketName,
      Key: key,
      Body: content
    };
    const s3result = await s3.send(new PutObjectCommand(bucketParams));
  } catch (err) {
    console.error('putToBucket: error:', err, bucketName, key);
    throw err;
  }
}
