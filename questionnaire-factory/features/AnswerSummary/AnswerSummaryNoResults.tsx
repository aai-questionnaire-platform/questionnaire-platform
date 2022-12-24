import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BadgeImage from '@/components/BadgeImage';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Typography from '@/components/Typography';

interface AnswerSummaryNoResultsProps {
  image?: string;
}

const NoResultsContainer = styled.div`
  padding: 0 40px;
  padding-top: 25vh;
`;

const NoResultsHeading = styled(Heading)`
  margin-bottom: 34px;
`;

function AnswerSummaryNoResults({ image }: AnswerSummaryNoResultsProps) {
  const { t } = useTranslation();

  return (
    <NoResultsContainer>
      <Flex direction="column" align="center">
        <NoResultsHeading variant="h1">
          {t('answerSummary.noResultsHeading')}
        </NoResultsHeading>

        {image && <BadgeImage src={image} alt="" />}

        <Typography align="center">
          {t('answerSummary.noResultsDescription')}
        </Typography>
      </Flex>
    </NoResultsContainer>
  );
}

export default AnswerSummaryNoResults;
