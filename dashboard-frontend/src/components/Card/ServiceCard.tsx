import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Service } from '@/api/types';

import Icon from '../Icon';
import Card from './Card';
import CardCtaButton from './CardCtaButton';
import CardTop from './CardTop';
import Comments from './Comments';

const Provider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  min-width: 156px;
  max-width: 200px;
  padding: 8px 20px;
  box-sizing: border-box;
  border-radius: 0 0 10px 10px;
  background-color: ${({ theme }) => theme.white};
`;

const Content = styled.div`
  align-content: flex-start;
  box-sizing: border-box;
  width: 100%;
`;

const StyledTitle = styled.h2`
  display: flex;
  align-items: center;
  padding: 20px 25px 0 25px;
  font-size: 1.125rem;
`;

const Status = styled.div`
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-left: 10px;
  background-color: ${({ theme }) => theme.statusIndicator};
`;

const Description = styled.div`
  font-weight: 300;
  font-size: 14px;
  line-height: 20px;
  padding: 0 25px 50px 25px;
`;

const StyledImage = styled.img`
  max-height: 100%;
  max-width: 100%;
`;

const ExternalLinkIcon = styled(Icon)`
  margin-left: 6px;
`;

function ServiceCard({
  service: {
    serviceProvider,
    coverPhoto,
    title,
    available,
    description,
    link,
    comments,
    commentImage,
    commentTitle,
  },
}: {
  service: Service;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardTop backgroundImage={coverPhoto.big.src}>
        <Provider>
          <StyledImage
            alt={serviceProvider.logo.alt}
            src={serviceProvider.logo.src}
          />
        </Provider>
      </CardTop>

      <Content>
        <StyledTitle>
          {title}
          {available && <Status />}
        </StyledTitle>
        <Description>{description}</Description>
        {comments && commentTitle && commentImage && (
          <Comments
            commentTitle={commentTitle}
            commentImage={commentImage}
            comments={comments}
          />
        )}
      </Content>

      {link.external ? (
        <CardCtaButton as="a" href={link.src} target="_blank" rel="noreferrer">
          {link.text}
          <ExternalLinkIcon
            icon="external-link"
            size={18}
            alt={t('opensInNewTab')}
          />
        </CardCtaButton>
      ) : (
        <CardCtaButton as="a" href={link.src} target="_self">
          {link.text}
        </CardCtaButton>
      )}
    </Card>
  );
}

export default ServiceCard;
