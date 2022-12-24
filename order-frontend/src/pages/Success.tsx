import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useServices } from '@/api/hooks';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Header from '@/components/Header';
import Icon from '@/components/Icon';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SuccessMessage = styled.p`
  font-size: 14px;
  text-align: center;
`;

const SuccessCard = styled(Card)`
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  margin-bottom: 2.5rem;
  padding: 60px 28px 30px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

function Success() {
  const { id } = useParams();
  const { data: services } = useServices();
  const { t } = useTranslation();

  const currentService = services?.find((service) => service.id === id);

  return currentService ? (
    <PageContainer>
      <Header
        icon={
          <Icon alt={t('success.backToServices')} icon="arrow-left" size={30} />
        }
        text="Huolehtivat nuoret"
        linkProps={{ to: '/' }}
      />

      <SuccessCard>
        <img
          width={100}
          alt={currentService.serviceProvider.logo.alt}
          src={currentService.serviceProvider.logo.src}
        />

        <SuccessMessage>{currentService.successMessage ?? ''}</SuccessMessage>

        <Button as={Link} to="/">
          {t('success.backToServices')}
        </Button>
      </SuccessCard>
    </PageContainer>
  ) : null;
}

export default Success;
