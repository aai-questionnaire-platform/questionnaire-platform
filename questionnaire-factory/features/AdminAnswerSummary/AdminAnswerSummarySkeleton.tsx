import * as R from 'ramda';
import styled from 'styled-components';

import Skeleton from '@/components/Skeleton';

interface AdminAnswerSummarySkeletonProps {
  rows: number;
}

const SkeletonDescription = styled(Skeleton)`
  margin: 1rem 0;
`;

const SkeletonBanner = styled(Skeleton)`
  margin-bottom: 2rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
`;

const SkeletonListItem = styled(Skeleton)`
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

function AdminAnswerSummarySkeleton({ rows }: AdminAnswerSummarySkeletonProps) {
  return (
    <div data-cy="admin-answer-summary-skeleton">
      <Skeleton color="#fff" width={200} height={28} />
      <SkeletonDescription color="#fff" width={300} height={24} />
      <SkeletonBanner color="#fff" width="100%" height={80} />

      {R.range(0, rows).map((i) => (
        <SkeletonListItem
          key={i}
          width="100%"
          height={56}
          color="#fff"
          delay={i * 250}
        />
      ))}
    </div>
  );
}

export default AdminAnswerSummarySkeleton;
