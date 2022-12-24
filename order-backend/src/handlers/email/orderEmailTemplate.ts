import { readFromFile } from '../../aws-wrappers/read-file-from-bucket';
import { ContactDetailsProps } from './sendEmail';

export function emailTemplate(contactDetails: string) {
  return `
  My custom email template text
  ${contactDetails}
  `;
}

interface LabelObjectProps {
  name: string;
  label: string;
}

export async function joinContactDetails(contactDetails: ContactDetailsProps) {
  const labels: LabelObjectProps[] = await readFromFile(
    process.env.SERVICE_PROVIDERS_BUCKET_NAME as string,
    'contactDetailsLabels.json'
  );

  let concatenatedContactDetails = '';
  for (let [key, value] of Object.entries(contactDetails)) {
    // fetch translation for key
    const label = labels.find((item) => item.name === key)?.label || key;
    concatenatedContactDetails =
      concatenatedContactDetails + `<p>${label}: ${value}</p>`;
  }
  return concatenatedContactDetails;
}
