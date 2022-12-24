import * as Yup from 'yup';

import { Service } from '@/api/types';

type FormData = { [k: string]: string };
type SchemaRules = { [k: string]: Yup.StringSchema };

// TODO: Improve schema rules if needed
const schemaRules: SchemaRules = {
  lastName: Yup.string(),
  firstName: Yup.string(),
  phone: Yup.string(),
  email: Yup.string().email('invalidEmail'),
  address: Yup.string(),
  postalCode: Yup.string()
    .test('len', 'postalCodeLength', (val) => !val || val.length === 5)
    .matches(/^\d+$/, 'postalCodeNumber'),
  city: Yup.string(),
  doorCode: Yup.string(),
  additionalInfo: Yup.string(),
};

export function createValidationSchema(service?: Service) {
  if (!service || !service.formFields) {
    return Yup.object({});
  }

  const rules = service.formFields.reduce((obj, field) => {
    const rule = schemaRules[field.name];
    const ruleWithRequired = field.required ? rule.required('required') : rule;
    return { ...obj, [field.name]: ruleWithRequired };
  }, {} as SchemaRules);

  return Yup.object(rules);
}

export function initFormData(service?: Service) {
  if (!service || !service.formFields) {
    return {};
  }

  const obj: FormData = {};
  for (const field of service.formFields) {
    obj[field.name] = '';
  }
  return obj;
}
