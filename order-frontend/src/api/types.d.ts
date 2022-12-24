type ImageProps = {
  alt: string;
  src: string;
};

type DescriptionProps = {
  long?: string;
  short: string;
};

export interface LocationProps {
  title: string;
  address: string;
  phone: string;
}

export type Contact = {
  name: string;
  contactEntries: string[];
};

export interface Service {
  id: string;
  name: string;
  description: DescriptionProps;
  code?: number;
  coverPhoto: { big: ImageProps; small: ImageProps };
  serviceProvider: {
    name?: string;
    logo: ImageProps;
  };
  privacyPolicy: {
    link: string;
    name: string;
  };
  successMessage?: string;
  orderType: 'code' | 'contact' | 'form';
  formFields?: {
    label: string;
    name: string;
    required: boolean;
    type: string;
  }[];
  category: string;
  available: boolean;
  contactInfo?: Contact[];
  location?: LocationProps;
}
