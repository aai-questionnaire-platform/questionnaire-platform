import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Service } from '@/api/types';
import Icon from '@/components/Icon';
import Link from '@/components/Link';
import paths from '@/routes/paths';

const StyledLink = styled(Link)`
  margin: 24px 0;
`;

const Container = styled.div`
  align-self: flex-start;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: calc(100% - 28px);
  height: 80px;
  padding: 0 20px;
  background-color: ${({ theme }) => theme.white};
  border: 2px solid ${({ theme }) => theme.secondary};
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.text};
`;

const Description = styled.span`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.text};
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: -28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.white};
`;

interface RecommendationBannerProps {
  recommendations: Service[];
}

function RecommendationBanner({ recommendations }: RecommendationBannerProps) {
  const { t } = useTranslation();

  const singleRecommendation = recommendations.length === 1;

  return (
    <StyledLink to={paths.RECOMMENDATIONS}>
      <Container>
        <Title>
          {singleRecommendation
            ? t('home.recommendationBanner.singleRecommendationTitle')
            : t('home.recommendationBanner.multipleRecommendationsTitle')}
        </Title>
        {singleRecommendation && (
          <Description>{recommendations[0].title}</Description>
        )}
        <Button>
          <Icon icon="chevron-right" alt={''} size={30} />
        </Button>
      </Container>
    </StyledLink>
  );
}

export default RecommendationBanner;
