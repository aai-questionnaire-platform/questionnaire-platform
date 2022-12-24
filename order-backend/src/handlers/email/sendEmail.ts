import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { readFromFile } from '../../aws-wrappers/read-file-from-bucket';
import logger from '../../services/log-service';
import { emailTemplate, joinContactDetails } from './orderEmailTemplate';

const sesClient = new SESClient({});

interface ConstructMessageProps {
  recipients: string[];
  message: string;
  subject: string;
  senderAddress: string;
}

const constructMessage = ({
  recipients,
  message,
  subject,
  senderAddress,
}: ConstructMessageProps) => {
  return {
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: senderAddress,
  };
};

export interface ContactDetailsProps {
  address?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  postalCode?: string;
  doorCode?: string;
  additionalInfo?: string;
  email?: string;
}

interface OrderInterfaceProps {
  serviceId: string;
  contactDetails: ContactDetailsProps;
}

export interface ServiceProviderProps {
  id: string;
  emails: string[];
}

export const sendEmail = async ({
  serviceId,
  contactDetails,
}: OrderInterfaceProps) => {
  try {
    const details = await joinContactDetails(contactDetails);
    const messageBody = emailTemplate(details);

    const serviceProviders: ServiceProviderProps[] = await readFromFile(
      process.env.SERVICE_PROVIDERS_BUCKET_NAME as string,
      'serviceProviders.json'
    );

    const serviceProvider = serviceProviders.find(
      (provider) => provider.id === serviceId
    );

    if (serviceProvider) {
      logger.debug('recipients', JSON.stringify(serviceProvider.emails));
      logger.debug(
        'sender address',
        process.env.ORDER_SENDER_ADDRESS as string
      );
      const data = await sesClient.send(
        new SendEmailCommand(
          constructMessage({
            recipients: serviceProvider.emails,
            message: messageBody,
            subject: 'Uusi tilaus ',
            senderAddress: process.env.ORDER_SENDER_ADDRESS as string,
          })
        )
      );
      return data; // For unit tests.
    } else {
      throw new Error('No service provider contact details were found');
    }
  } catch (err) {
    logger.error('Error', err);
    return err;
  }
};
