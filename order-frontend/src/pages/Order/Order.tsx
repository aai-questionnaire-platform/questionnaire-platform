import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useServices } from '@/api/hooks';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import { createValidationSchema, initFormData } from '@/pages/Order/util';
import { postWithAuth } from '@/api/rest-connector';
import Link from '@/components/Link';

interface OrderProps {
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

const OrderForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: left;
  width: 100%;
  padding: 25px;
  margin-bottom: 32px;
  box-sizing: border-box;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  border-radius: 50px;
  background-color: #fff;
`;

const StyledTitle = styled.h3`
  text-align: center;
  margin-bottom: 30px;
`;

const RequiredFieldInfo = styled.p`
  margin: 20px 0 10px 0;

  &:after {
    content: ' *';
    color: red;
  }
`;

const PrivacyPolicy = styled.p`
  margin: 10px 0 20px 0;
`;

const SubmitButton = styled(Button)`
  margin: 10px 20px;

  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  background-color: ${({ theme }) => theme.primary};
`;

async function postOrder({ serviceId, contactDetails }: OrderProps) {
  return postWithAuth(JSON.stringify({ serviceId, contactDetails }), 'order');
}

function Order() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: services } = useServices();
  const { t } = useTranslation();

  const [loadingState, setLoadingState] = useState(false);
  const [, setErrorMessage] = useState('');

  const service = services?.find((service) => service.id === id);

  const handleFormSubmit = async (values: any) => {
    try {
      setLoadingState(true);
      setErrorMessage('');

      const serviceId = service!.id;

      await postOrder({
        serviceId,
        contactDetails: values,
      });

      navigate(`/${id}/success`, { replace: true });
    } catch (e: any) {
      setErrorMessage('TODO: Error message');
      console.error(e.message);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (service && !service.available) {
      navigate('/');
    }
  }, [service, navigate]);

  const formik = useFormik({
    initialValues: initFormData(service),
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: createValidationSchema(service),
    onSubmit: handleFormSubmit,
  });

  return (
    <>
      <Header
        icon={<Icon alt={t('back')} icon="arrow-left" size={30} />}
        text={'Huolehtivat nuoret'}
        linkProps={{ to: `/${id}` }}
      />
      <OrderForm autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
        <StyledTitle>{t('order.title')}</StyledTitle>

        {service?.formFields?.map((field, index) => (
          <FormInput
            key={index}
            error={formik.errors[field.name]}
            label={field.label}
            name={field.name}
            required={field.required}
            type={field.type}
            onChange={formik.handleChange}
            value={formik.values[field.name]}
          />
        ))}

        <RequiredFieldInfo>{t('order.requiredField')}</RequiredFieldInfo>

        <PrivacyPolicy>
          <Trans
            i18nKey="order.privacyPolicy"
            values={{ serviceProvider: service?.privacyPolicy.name }}
            components={{
              Link: <Link to={service?.privacyPolicy.link ?? ''} external />,
            }}
          />
        </PrivacyPolicy>

        <SubmitButton disabled={loadingState} type="submit">
          {loadingState ? <Loader color="#fff" /> : t('order.orderProduct')}
        </SubmitButton>
      </OrderForm>
    </>
  );
}

export default Order;
