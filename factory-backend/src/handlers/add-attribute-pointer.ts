import { DynamoDBStreamEvent } from 'aws-lambda';
import { AttributeService } from '../services/attribute-service';

const addAttributePointer = async (event: DynamoDBStreamEvent) => {
  try {
    const service = new AttributeService(
      process.env.ATTRIBUTE_TABLE_NAME as string,
      process.env.AAI_ATTRIBUTES as string,
      process.env.TOKEN_TABLE_NAME as string,
      process.env.NEXTAUTH_PROVIDER as string,
      process.env.AAI_SERVICE_URL as string
    );

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        await service.addAttributePointer(record);
      }
    }
  } catch (error) {
    console.error('addAttributePointer error', error);
  }
};

export { addAttributePointer };
