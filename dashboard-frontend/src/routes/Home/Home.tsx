import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useRecommendations } from '@/api/hooks';
import SrOnly from '@/components/SrOnly';
import Toast from '@/components/Toast';
import AuroraAiLogo from '@/images/Aurora-logo.png';
import ForYouList from '@/routes/Home/ForYouList';
import Navigation from '@/routes/Home/Navigation';
import RecommendationBanner from '@/routes/Home/RecommendationBanner';

const HomeHeader = styled.header`
  width: 100%;
  text-align: center;
`;

const Logo = styled.img`
  width: 80px;
  margin: 1.5em 0;
`;

const Heading = styled.h2`
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 31px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

function Home() {
  const { t } = useTranslation();
  const { data, error } = useRecommendations(
    !localStorage.getItem('seenRecommendations')
  );

  return (
    <>
      {error && <Toast message={t('error.backend')} />}

      <HomeHeader>
        <Logo src={AuroraAiLogo} alt="" />
        <SrOnly as="h1">{t('home.heading')}</SrOnly>
      </HomeHeader>

      <Navigation />

      <main>
        {data?.length && <RecommendationBanner recommendations={data} />}
        <Heading>{t('home.services.forYou')}</Heading>
        <ForYouList />
      </main>
    </>
  );
}

export default Home;
