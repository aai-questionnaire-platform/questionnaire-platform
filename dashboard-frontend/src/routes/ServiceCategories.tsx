import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useServiceCategories } from '@/api/hooks';
import Header from '@/components/Header';
import ServiceCategoryList from '@/components/ServiceCategoryList';
import ServiceCategoryListItem from '@/components/ServiceCategoryListItem';
import ServiceCategoryListSkeleton from '@/components/ServiceCategoryListSkeleton';
import Toast from '@/components/Toast';
import paths from '@/routes/paths';
import { withUrlParams } from '@/utils';

const NoCategoriesMessage = styled.p`
  text-align: center;
`;

function ServiceCategories() {
  const { t } = useTranslation();
  const { data, error, loading } = useServiceCategories();

  return (
    <>
      {error && <Toast message={t('error.backend')} />}
      <Header title={t('home.services.title')} />

      <main>
        {loading && <ServiceCategoryListSkeleton />}

        {!loading && data?.length ? (
          <ServiceCategoryList>
            {data.map((category, index) => (
              <ServiceCategoryListItem
                label={category.title}
                to={withUrlParams(paths.SERVICES, {
                  categoryId: category.id,
                })}
                coverPhoto={category.image}
                key={index}
              />
            ))}
          </ServiceCategoryList>
        ) : (
          <NoCategoriesMessage>
            {t('home.serviceCategories.noCategories')}
          </NoCategoriesMessage>
        )}
      </main>
    </>
  );
}

export default ServiceCategories;
