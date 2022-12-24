import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Card from '@/components/Card/Card';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import Tabs, { Tab } from '@/components/Tabs';

const ProfileCard = styled(Card)`
  align-items: stretch;
  flex: 1;
  margin-bottom: 24px;
`;

const TabContent = styled.div`
  margin-top: -3px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const IconContainer = styled.div`
  padding-top: 30px;
  display: flex;
  justify-content: center;
`;

const CircledIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 96px;
  width: 96px;
  border: 1px solid #000;
  border-radius: 50%;
  margin-bottom: 50px;
`;

function Profile() {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t('profile.title')} />

      <ProfileCard as="main">
        <IconContainer>
          <CircledIcon>
            <Icon size={30} icon="user" />
          </CircledIcon>
        </IconContainer>

        <Tabs>
          <Tab label={t('profile.tabs.profile')}>
            <TabContent>
              <p>{t('profile.underConstruction')}</p>
            </TabContent>
          </Tab>

          <Tab label={t('profile.tabs.services')}>
            <TabContent>
              <p>{t('profile.underConstruction')}</p>
            </TabContent>
          </Tab>
        </Tabs>
      </ProfileCard>
    </>
  );
}

export default Profile;
