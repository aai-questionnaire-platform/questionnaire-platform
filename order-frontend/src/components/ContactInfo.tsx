import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Contact } from '@/api/types';
import Icon from '@/components/Icon';

const ContactUsText = styled.p`
  font-size: 14px;
  line-height: 18px;
`;

const ContactContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 16px 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  border: 1px solid black;
  margin-right: 10px;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-size: 14px;
  line-height: 18px;
  margin: 3px 0;
  color: #000;
`;

const ContactEntry = styled.span`
  font-size: 14px;
  line-height: 18px;
  margin: 2px 0;
  color: #747474;
`;

interface ContactInfoProps {
  info: Contact[];
}

function ContactInfo({ info }: ContactInfoProps) {
  const { t } = useTranslation();

  return (
    <>
      <ContactUsText>{t('services.contact')}:</ContactUsText>
      {info.map((item, i) => (
        <ContactContainer key={i}>
          <IconContainer>
            <Icon icon="contact" size={30} />
          </IconContainer>
          <InfoContainer>
            <Name>{item.name}</Name>
            {item.contactEntries.map((entry, i) => (
              <ContactEntry key={i}>{entry}</ContactEntry>
            ))}
          </InfoContainer>
        </ContactContainer>
      ))}
    </>
  );
}

export default ContactInfo;
