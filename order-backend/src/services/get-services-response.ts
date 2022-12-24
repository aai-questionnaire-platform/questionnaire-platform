import { Service } from '../types';

const response: Service[] = [
  {
    id: '1',
    name: 'Service name',
    merchantName: 'merchant',
    description: {
      short: 'Short description',
      long: 'Long description',
    },
    orderType: 'form',
    formFields: [
      { label: 'Sukunimi', name: 'lastName', required: true, type: 'text' },
      { label: 'Etunimi', name: 'firstName', required: true, type: 'text' },
      { label: 'Puhelinnumero', name: 'phone', required: true, type: 'text' },
      { label: 'Osoite', name: 'address', required: true, type: 'text' },
      {
        label: 'Postinumero',
        name: 'postalCode',
        required: true,
        type: 'text',
      },
      { label: 'Toimipaikka', name: 'city', required: true, type: 'text' },
      { label: 'Ovikoodi', name: 'doorCode', required: false, type: 'text' },
      {
        label: 'Lisätietoja kuljetusta varten',
        name: 'additionalInfo',
        required: false,
        type: 'textarea',
      },
    ],
    privacyPolicy: {
      link: 'link',
      name: 'Name',
    },
    successMessage: 'Kiitos!',
    coverPhoto: {
      big: {
        src: 'source',
        alt: 'alt',
      },
      small: {
        src: 'source',
        alt: 'alt',
      },
    },
    serviceProvider: {
      logo: {
        src: 'source',
        alt: 'alt',
      },
    },
    category: 'category',
  },
];

export default response;
