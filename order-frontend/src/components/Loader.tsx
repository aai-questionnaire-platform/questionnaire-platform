import styled, { keyframes } from 'styled-components';

import { theme } from '@/theme';

const loaderAnim = keyframes`
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const Container = styled.div<{ color?: string }>`
  display: flex;
  flex-direction: row;

  & > div {
    width: 12px;
    height: 12px;
    margin: 0 4px;
    opacity: 0.1;
    border-radius: 50%;
    transform: scale(0);
    animation: ${loaderAnim} 0.6s infinite alternate;
    background-color: ${({ color }) => color};
  }

  & > div:nth-child(2) {
    animation-delay: 0.2s;
  }

  & > div:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

Container.defaultProps = {
  color: theme.primary,
};

interface LoaderProps {
  color?: string;
}

function Loader({ color }: LoaderProps) {
  return (
    <Container color={color}>
      <div />
      <div />
      <div />
    </Container>
  );
}

export default Loader;
