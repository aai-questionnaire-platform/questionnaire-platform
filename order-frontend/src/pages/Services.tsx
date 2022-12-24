import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useServices } from '@/api/hooks';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ServiceCard from '@/components/ServiceCard';

const WelcomeText = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  & > li {
    margin-bottom: 32px;
  }
`;

function Services() {
  const { data: services } = useServices();
  const { t } = useTranslation();

  return (
    <>
      <Header
        icon={
          <Icon alt={t('services.backButtonAlt')} icon="arrow-left" size={30} />
        }
        text={'Header'}
        linkProps={{
          to: process.env.REACT_APP_APP_URL_DASHBOARD as string,
          external: true,
          target: 'self',
        }}
      />
      <WelcomeText>
        <h1>{t('services.welcomeTitle')}</h1>
        {t('services.welcomeText')}
      </WelcomeText>
      <List>
        {services?.map((service, index) => (
          <li key={index}>
            <ServiceCard service={service} open={false} />
          </li>
        ))}
      </List>
    </>
  );
}

export default Services;
