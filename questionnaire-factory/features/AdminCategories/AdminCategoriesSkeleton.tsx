import * as R from 'ramda';
import styled from 'styled-components';

import Divider from '@/components/Divider';
import Skeleton from '@/components/Skeleton';
import { useAppTheme } from '@/util/hooks';

interface AdminCategoriesSkeletonProps {
  rows: number;
}

const SkeletonDescription = styled(Skeleton)`
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

const SkeletonPin = styled(Skeleton)`
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
`;

const ItemContainer = styled.div`
  display: flex;
`;

const SkeletonStateIndicator = styled(Skeleton)`
  margin-right: 0.75rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

const SkeletonListItem = styled(Skeleton)`
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
`;

function AdminCategoriesSkeleton({ rows }: AdminCategoriesSkeletonProps) {
  const theme = useAppTheme();

  return (
    <>
      <Skeleton color="#fff" width={200} height={28} />
      <SkeletonDescription color="#fff" width={300} height={24} />
      <SkeletonPin color="#fff" width="100%" height={56} />

      <Divider color={theme.adminCategories?.divider} />

      {R.range(0, rows).map((i) => (
        <ItemContainer key={i} data-cy="admin-categories-skeleton">
          <SkeletonStateIndicator
            color="#fff"
            width={56}
            height={56}
            variant="circle"
            delay={i * 250}
          />
          <SkeletonListItem
            width="calc(100% - 56px)"
            height={150}
            color="#fff"
            delay={i * 250}
          />
        </ItemContainer>
      ))}
    </>
  );
}

export default AdminCategoriesSkeleton;
