import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useCategory, useServices } from '@/api/hooks';
import ServiceCard from '@/components/Card/ServiceCard';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import ServicesSkeleton from '@/routes/Services/ServicesSkeleton';
import { useQueryParams } from '@/utils';

const List = styled.ul`
  list-style-type: none;
  margin: 30px 0 0 0;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 60px;
`;

const NoServicesMessage = styled.p`
  text-align: center;
`;

function Services() {
  const { t } = useTranslation();
  const { categoryId, serviceId } = useQueryParams();
  const {
    data,
    error: servicesError,
    loading: servicesLoading,
  } = useServices();
  const {
    data: category,
    error: categoryError,
    loading: categoryLoading,
  } = useCategory(categoryId);

  const loading = servicesLoading || categoryLoading;
  const error = servicesError || categoryError;

  const services = data?.filter((service) => {
    if (serviceId && service.id !== serviceId) {
      return false;
    }
    return service.categoryId === categoryId;
  });

  if (loading) {
    return (
      <>
        <Header title={t('services.title')} />
        <ServicesSkeleton />
      </>
    );
  }

  return (
    <main>
      {error && <Toast message={t('error.backend')} />}
      <Header title={category?.title ?? t('services.title')} />
      {services?.length ? (
        <List>
          {services.map((service, index) => (
            <ListItem key={index}>
              <ServiceCard service={service} />
            </ListItem>
          ))}
        </List>
      ) : (
        <NoServicesMessage>{t('services.noServices')}</NoServicesMessage>
      )}
    </main>
  );
}

export default Services;
