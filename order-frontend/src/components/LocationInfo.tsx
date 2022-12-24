import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { LocationProps } from '@/api/types';
import Icon from '@/components/Icon';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 24px;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  border: 1px solid #000;
  border-radius: 50%;
`;

const TextContainer = styled.div`
  margin-left: 10px;
`;

const Text = styled.p`
  margin: 7px 0;
`;

const LightText = styled(Text)`
  color: #747474;
`;

function LocationInfo({ title, address, phone }: LocationProps) {
  const { t } = useTranslation();

  return (
    <Container>
      <IconContainer>
        <Icon alt={t('home.location')} icon="map-marker" size={30} />
      </IconContainer>
      <TextContainer>
        <Text>{title}</Text>
        <LightText>{address}</LightText>
        <LightText>{phone}</LightText>
      </TextContainer>
    </Container>
  );
}

export default LocationInfo;
