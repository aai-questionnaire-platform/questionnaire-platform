import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Icon from '@/components/Icon';
import NavigationElement from '@/routes/Home/Navigation/NavigationElement';
import paths from '@/routes/paths';

const Container = styled.nav`
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid #f2f2f2;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  border-radius: 50px;
  display: flex;
  padding: 5px;
  justify-content: space-evenly;
  margin-bottom: 32px;
  position: sticky;
  z-index: 2;
  top: 20px;
`;

function Navigation() {
  const { t } = useTranslation();

  const [hideTitles, setHideTitles] = useState(false);

  const handleScroll = () => {
    const scrollPosition = window.pageYOffset;
    setHideTitles(scrollPosition >= 59);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Container>
      <NavigationElement
        hideTitles={hideTitles}
        to={paths.HOME}
        icon={
          <Icon alt={t('home.navigation.favourites')} icon="heart" size={30} />
        }
        text={t('home.navigation.favourites')}
      />
      <NavigationElement
        hideTitles={hideTitles}
        to={paths.SERVICE_CATEGORIES}
        icon={
          <Icon alt={t('home.navigation.services')} icon="layers" size={30} />
        }
        text={t('home.navigation.services')}
      />
      <NavigationElement
        hideTitles={hideTitles}
        to={paths.INFO}
        icon={<Icon alt={t('home.navigation.info')} icon="info" size={30} />}
        text={t('home.navigation.info')}
      />
      <NavigationElement
        hideTitles={hideTitles}
        to={paths.PROFILE}
        icon={<Icon alt={t('home.navigation.profile')} icon="user" size={30} />}
        text={t('home.navigation.profile')}
      />
    </Container>
  );
}

export default Navigation;
