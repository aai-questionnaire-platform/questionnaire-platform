type DescriptionProps = {
  long?: string;
  short: string;
};

type ImageProps = {
  alt: string;
  src: string;
};

interface LocationProps {
  title: string;
  address: string;
  phone: string;
}

type Contact = {
  name: string;
  contactEntries: string[];
};

export interface Service {
  id: string;
  name: string;
  merchantName?: string;
  description: DescriptionProps;
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
  contactInfo?: Contact[];
  location?: LocationProps;
}

export type ServiceDto = Service & {
  available: boolean;
};

export interface Order {
  userId: string;
  orderId: string;
  serviceId: string;
}

export interface OrderDto {
  orderId: string;
  serviceId: string;
  contactDetails: {
    address?: string;
    city?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    postalCode?: string;
    doorCode?: string;
    additionalInfo?: string;
    email?: string;
  };
}

export type Dict<T> = Record<string, T>;
