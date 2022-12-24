import Card from '@/components/CategoryCommon/Card';
import Skeleton from '@/components/Skeleton';

import { CategoryContentContainer } from './CategoryLayout';

function CategorySkeleton() {
  return (
    <CategoryContentContainer>
      <Card>
        <Skeleton height="100%" width="100%" />
      </Card>
    </CategoryContentContainer>
  );
}

export default CategorySkeleton;
