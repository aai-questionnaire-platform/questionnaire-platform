import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function putToBucket(
  bucketName: string,
  key: string,
  content: string
) {
  try {
    console.info(
      `Publishing content to bucket ${bucketName} with filename ${key}`,
      content
    );

    //Construct the S3 client
    const s3 = new S3Client({});
    const bucketParams = {
      Bucket: bucketName,
      Key: key,
      Body: content,
    };
    return await s3.send(new PutObjectCommand(bucketParams));
  } catch (err) {
    console.error('putToBucket: error:', err, bucketName, key);
    throw err;
  }
}
