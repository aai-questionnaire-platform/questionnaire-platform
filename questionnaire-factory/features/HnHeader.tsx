import { MouseEvent } from 'react';
import styled from 'styled-components';

import Button from '@/components/Button';
import Icon from '@/components/Icon';

const BackButton = styled(Button)`
  position: absolute;
  left: 15px;
  line-height: 0;
`;

const Container = styled.header`
  width: 100%;
  position: sticky;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.75);
  border: 2px solid #f2f2f2;
  box-shadow: 0px 4px 10px rgba(184, 184, 184, 0.25);
  border-radius: 50px;
  z-index: 2;
`;

const StyledTitle = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

interface HnHeaderProps {
  title: string;
  buttonAlt: string;
  onButtonClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

function HnHeader({ buttonAlt, title, onButtonClick }: HnHeaderProps) {
  return (
    <Container>
      <BackButton
        data-cy="hnheader-back-link"
        variant="flat"
        iconOnly
        aria-label={buttonAlt}
        onClick={onButtonClick}
      >
        <Icon alt="" icon="arrow-left" size={30} />
      </BackButton>
      <StyledTitle>{title}</StyledTitle>
    </Container>
  );
}

export default HnHeader;
