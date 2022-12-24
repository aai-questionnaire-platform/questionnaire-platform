import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Service } from '@/api/types';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CodeButton from '@/components/CodeButton';
import ContactInfo from '@/components/ContactInfo';
import LocationInfo from '@/components/LocationInfo';

const TopHalf = styled.div<{ backgroundImage: string }>`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 250px;
  background: ${({ backgroundImage }) =>
    `url(${backgroundImage}) no-repeat center center`};
  background-size: cover;
`;

const Provider = styled.div`
  display: flex;
  align-items: center;
  height: 20px;
  padding: 15px 40px;
  border-radius: 0 0 10px 10px;
  background-color: ${({ theme }) => theme.white};
  margin-top: -1px;
`;

const Content = styled.div`
  align-content: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding: 0 25px;
`;

const StyledTitle = styled.h3`
  display: flex;
  align-items: center;
  padding-top: 20px;
`;

const Description = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
`;

const StyledImage = styled.img`
  width: 70px;
  padding: 0 20px;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

function ServiceCard({
  service: {
    serviceProvider,
    coverPhoto,
    name,
    description,
    id,
    category,
    location,
    orderType,
    contactInfo,
    available,
  },
  open,
}: {
  service: Service;
  open: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!open) {
    return (
      <Card id={name}>
        <TopHalf backgroundImage={coverPhoto.big.src}>
          <Provider>{category}</Provider>
        </TopHalf>

        <Content>
          <StyledTitle>{name}</StyledTitle>
          <Description>{description.short}</Description>
        </Content>

        <ButtonContainer>
          <Button
            onClick={() => navigate(`/${id}`)}
            disabled={orderType !== 'code' && !available}
          >
            {t(chooseButtonLabel(available, orderType))}
          </Button>
        </ButtonContainer>
      </Card>
    );
  }

  return (
    <Card id={name}>
      <TopHalf backgroundImage={coverPhoto.small.src}>
        <Provider>
          <StyledImage
            alt={serviceProvider.logo.alt}
            src={serviceProvider.logo.src}
          />
        </Provider>
      </TopHalf>

      <Content>
        <StyledTitle>{name}</StyledTitle>
        <Description>{description.long}</Description>
        {location && (
          <LocationInfo
            title={location.title}
            address={location.address}
            phone={location.phone}
          />
        )}

        {orderType === 'contact' && contactInfo && (
          <ContactInfo info={contactInfo} />
        )}
      </Content>

      {orderType !== 'contact' && (
        <ButtonContainer>
          {orderType === 'code' && <CodeButton serviceId={id} />}
          {orderType === 'form' && (
            <Button
              onClick={() => navigate(`/${id}/order`)}
              disabled={!available}
            >
              {available ? t('services.orderFree') : t('services.ordered')}
            </Button>
          )}
        </ButtonContainer>
      )}
    </Card>
  );
}

function chooseButtonLabel(available: boolean, orderType: string) {
  if (orderType === 'code') {
    return 'services.order';
  }

  if (!available) {
    return 'services.ordered';
  }

  if (orderType === 'contact') {
    return 'services.seeContactInfo';
  }

  return 'services.order';
}

export default ServiceCard;
