import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Divider from '@/components/Divider';
import Heading from '@/components/Heading';
import Skeleton from '@/components/Skeleton';
import Spacer from '@/components/Spacer';

interface AnswerSummarySkeletonProps {
  rows: number;
}

const SkeletonListContainer = styled.div`
  padding: 0 16px;
  width: 100%;
`;

const SkeletonListItem = styled(Skeleton)`
  margin-bottom: 1rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

function AnswerSummarySkeleton({ rows }: AnswerSummarySkeletonProps) {
  const { t } = useTranslation();

  return (
    <>
      <Heading variant="h1" as="h2">
        {t('answerSummary.results')}
      </Heading>

      <Spacer mt={24} mb={48} style={{ width: '100%' }}>
        <Divider />
      </Spacer>

      <SkeletonListContainer>
        {R.range(0, rows).map((idx) => (
          <SkeletonListItem
            key={idx}
            width="100%"
            height="4.625rem"
            color="#fff"
            delay={idx * 250}
          />
        ))}
      </SkeletonListContainer>
    </>
  );
}

export default AnswerSummarySkeleton;
