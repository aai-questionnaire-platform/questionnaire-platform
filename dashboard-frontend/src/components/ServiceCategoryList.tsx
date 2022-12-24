import React, { Children, PropsWithChildren } from 'react';
import styled from 'styled-components';

const StyledList = styled.div`
  display: flex;
  flex-direction: row;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const Column = styled.div<{ position: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  & > * {
    margin: 8px;
    ${({ position }) =>
      position === 'left' ? `margin-left: 0` : `margin-right: 0`};
  }
`;

function ServiceCategoryList({ children }: PropsWithChildren<{}>) {
  const childrenArray = Children.toArray(children);
  const leftChildren = childrenArray.filter((_, index) => index % 2 === 0);
  const rightChildren = childrenArray.filter((_, index) => index % 2 === 1);

  return (
    <StyledList role="list">
      <Column position="left" role="group">
        {leftChildren}
      </Column>
      <Column position="right" role="group">
        {rightChildren}
      </Column>
    </StyledList>
  );
}

export default ServiceCategoryList;
