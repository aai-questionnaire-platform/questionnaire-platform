import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import ButtonBase from '@/components/ButtonBase';
import Icon from '@/components/Icon';

const Container = styled.header`
  position: sticky;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin: 24px 0;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.75);
  border: 2px solid #f2f2f2;
  border-radius: 50px;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  z-index: 2;
`;

const BackButton = styled(ButtonBase)`
  position: absolute;
  left: 15px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
`;

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('header');

  const navigateBack = () => navigate(-1);

  return (
    <Container>
      <BackButton aria-label={t('header.back')} onClick={navigateBack}>
        <Icon alt="" icon="arrow-left" size={30} />
      </BackButton>
      <Title>{title}</Title>
    </Container>
  );
}

export default Header;
