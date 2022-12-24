import React from 'react';
import styled from 'styled-components';

import ServiceCategoryList from '@/components/ServiceCategoryList';
import Skeleton from '@/components/Skeleton';

const StyledSkeleton = styled(Skeleton)`
  width: calc(100% - 8px);
  border-radius: 20px;
`;

function ServiceCategoryListSkeleton() {
  // These are just random numbers to add some randomness to the skeleton
  const skeletonHeights = [243, 215, 225, 236, 204, 221];

  return (
    <ServiceCategoryList>
      {skeletonHeights.map((height, index) => (
        <StyledSkeleton key={index} height={height} />
      ))}
    </ServiceCategoryList>
  );
}

export default ServiceCategoryListSkeleton;
