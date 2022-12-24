import {GetObjectCommand, HeadBucketCommand, S3Client} from '@aws-sdk/client-s3';

export async function readFromFile<Type>(
  bucketName: string,
  key: string,
  locale: string
): Promise<Type> {
  try {
    console.info('Seeking file', key, ' from bucket', bucketName);

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
    console.error('readFromFile: error:', err, bucketName, key);
    throw err;
  }
}

/**
 * Checks if bucket exists and if it's readable.
 * @param bucketName bucket name
 */
export async function doesExist(bucketName: string): Promise<boolean> {
  console.debug(`Reading bucket ${bucketName}`);
  const client = new S3Client({});
  const command = new HeadBucketCommand({ Bucket: bucketName});
  try {
    const response = await client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}
