import { HTMLProps, ReactNode, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Flex from '@/components/Flex';
import Icon from '@/components/Icon';
import { uniqueId } from '@/util';

export interface CollapsibleProps extends HTMLProps<HTMLDivElement> {
  heading: ReactNode;
}

const CollapsibleContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CollapsibleHeader = styled.button`
  color: inherit;
  background-color: inherit;
  border: none;
  cursor: pointer;
  padding: 0 1.5rem;
  outline-offset: -1px;
  border-radius: 12px;
`;

const CollapsibleIconContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 0.75rem;
  margin: 16px 0;
  border-radius: 999px;
  border: 1px solid #d5d8dd;
  aspect-ratio: 1 / 1;
  margin-left: 1rem;

  & > svg {
    min-width: 16px;
    transition: transform 0.2s ease-in-out;
    transform: rotate(${({ isExpanded }) => (isExpanded ? '-90deg' : '90deg')});
  }
`;

const CollapsibleContentWrapper = styled.section`
  transition: max-height 0.3s ease-in-out;
`;

const CollapsibleContent = styled.div`
  border-top: 1px solid #eeeff1;
  padding: 1rem 1.5rem;
`;

function Collapsible({ children, heading, ...rest }: CollapsibleProps) {
  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const enableAnimations = useRef(false);
  const index = useRef(uniqueId());

  useEffect(() => {
    setMaxHeight(
      expanded ? childrenContainerRef.current?.scrollHeight || 0 : 0
    );
  }, [expanded, childrenContainerRef]);

  useEffect(() => {
    setTimeout(() => {
      enableAnimations.current = true;
    }, 0);
  }, []);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <CollapsibleContainer {...(rest as any)}>
      <CollapsibleHeader
        id={`collapsible-trigger-${index.current}`}
        aria-expanded={expanded}
        aria-controls={`collapsible-content-${index.current}`}
        onClick={handleClick}
      >
        <Flex justify="space-between" align="center">
          {heading}

          <CollapsibleIconContainer isExpanded={expanded}>
            <Icon icon="chevron-right" />
          </CollapsibleIconContainer>
        </Flex>
      </CollapsibleHeader>

      <CollapsibleContentWrapper
        id={`collapsible-content-${index.current}`}
        ref={childrenContainerRef}
        aria-labelledby={`collapsible-trigger-${index.current}`}
        style={{ maxHeight }}
        aria-hidden={!expanded}
      >
        <CollapsibleContent>{children}</CollapsibleContent>
      </CollapsibleContentWrapper>
    </CollapsibleContainer>
  );
}

export default Collapsible;
