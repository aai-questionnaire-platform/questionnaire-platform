import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useServices } from '@/api/hooks';
import ServiceCategoryList from '@/components/ServiceCategoryList';
import ServiceCategoryListItem from '@/components/ServiceCategoryListItem';
import ServiceCategoryListSkeleton from '@/components/ServiceCategoryListSkeleton';
import Toast from '@/components/Toast';
import paths from '@/routes/paths';
import { withUrlParams } from '@/utils';

const NoCategoriesMessage = styled.p`
  text-align: center;
`;

function ForYouList() {
  const { t } = useTranslation();
  const { data, error, loading } = useServices();
  const recommended = data?.filter((service) => service.recommended);

  if (loading) {
    return <ServiceCategoryListSkeleton />;
  }

  return (
    <>
      {error && <Toast message={t('error.backend')} />}
      {recommended?.length ? (
        <ServiceCategoryList>
          {recommended.map((service, index) => (
            <ServiceCategoryListItem
              label={service.title}
              to={withUrlParams(paths.SERVICES, {
                categoryId: service.categoryId,
                serviceId: service.id,
              })}
              coverPhoto={service.coverPhoto.small}
              key={index}
            />
          ))}
        </ServiceCategoryList>
      ) : (
        <NoCategoriesMessage>
          {t('home.serviceCategories.noCategories')}
        </NoCategoriesMessage>
      )}
    </>
  );
}

export default ForYouList;
