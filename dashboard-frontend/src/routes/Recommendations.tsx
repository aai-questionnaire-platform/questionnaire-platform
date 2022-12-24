import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useRecommendations } from '@/api/hooks';
import ServiceCard from '@/components/Card/ServiceCard';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import ServicesSkeleton from '@/routes/Services/ServicesSkeleton';

const List = styled.ul`
  list-style-type: none;
  margin: 30px 0 0 0;
  padding: 0;
`;

const ListItem = styled.li`
  margin-bottom: 60px;
`;

const EmptyListMessage = styled.p`
  text-align: center;
`;

function Recommendations() {
  const { t } = useTranslation();
  const { data: services, error, loading } = useRecommendations();

  useEffect(() => {
    localStorage.setItem('seenRecommendations', 'true');
  }, []);

  const headerTitle = services?.length
    ? services[0].title
    : t('recommendations.title');

  return (
    <>
      {error && <Toast message={t('error.backend')} />}
      <Header title={headerTitle} />
      {loading ? (
        <ServicesSkeleton />
      ) : services?.length ? (
        <List>
          {services.map((service, index) => (
            <ListItem key={index}>
              <ServiceCard service={service} />
            </ListItem>
          ))}
        </List>
      ) : (
        <EmptyListMessage>
          {t('recommendations.noRecommendations')}
        </EmptyListMessage>
      )}
    </>
  );
}

export default Recommendations;
