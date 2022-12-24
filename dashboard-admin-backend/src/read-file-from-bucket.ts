import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import logger from '../services/log-service';

export async function readFromFile<Type>(
  bucketName: string,
  key: string
): Promise<Type> {
  try {
    logger.info('Seeking file', key, ' from bucket', bucketName);

    //Construct the S3 client
    const s3 = new S3Client({});
    const bucketParams = {
      Bucket: bucketName,
      Key: key,
    };
    // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
    const s3result = await s3.send(new GetObjectCommand(bucketParams));

    // Create a helper function to convert a ReadableStream to a string.
    const streamToString = (stream: any) =>
      new Promise((resolve, reject) => {
        const chunks = new Array<any>();
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });

    // Convert the ReadableStream to a string.
    const bodyContents = (await streamToString(s3result.Body)) as string;

    //Parse results as type
    return JSON.parse(bodyContents) as Type;
  } catch (err) {
    logger.error('readFromFile: error:', err, bucketName, key);
    throw err;
  }
}
