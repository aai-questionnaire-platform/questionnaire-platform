import React from 'react';
import styled from 'styled-components';

import Skeleton from '@/components/Skeleton';

const StyledSkeleton = styled(Skeleton)`
  width: 100%;
  border-radius: 20px;
  margin: 10px 0px;
`;

function ServicesSkeleton() {
  const array = Array.from(Array(4).keys());

  return (
    <>
      {array.map((_, index) => (
        <StyledSkeleton key={index} height={450} />
      ))}
    </>
  );
}

export default ServicesSkeleton;
