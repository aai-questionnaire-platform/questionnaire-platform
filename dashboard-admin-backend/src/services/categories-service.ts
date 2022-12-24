import { putToBucket } from '../aws-wrappers/put-file-to-bucket';
import { readFromFile } from '../aws-wrappers/read-file-from-bucket';
import { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const bucketName = process.env.JSON_BUCKET_NAME as string;
  const categoriesJsonName = process.env.CATEGORIES_FILE_NAME as string;
  return await readFromFile(bucketName, categoriesJsonName);
}

export async function saveCategories(categories: Category[]) {
  const bucketName = process.env.JSON_BUCKET_NAME as string;
  const categoriesJsonName = process.env.CATEGORIES_FILE_NAME as string;
  return await putToBucket(
    bucketName,
    categoriesJsonName,
    JSON.stringify(categories)
  );
}
