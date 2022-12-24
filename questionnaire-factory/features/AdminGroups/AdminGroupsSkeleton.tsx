import * as R from 'ramda';
import styled from 'styled-components';

import Skeleton from '@/components/Skeleton';

interface AdminGroupsSkeletonProps {
  rows: number;
}

const SkeletonListItem = styled(Skeleton)`
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

function AdminGroupsSkeleton({ rows }: AdminGroupsSkeletonProps) {
  return (
    <>
      {R.range(0, rows).map((idx) => (
        <SkeletonListItem
          key={idx}
          width="100%"
          height={300}
          color="#fff"
          delay={idx * 250}
        />
      ))}
    </>
  );
}

export default AdminGroupsSkeleton;
