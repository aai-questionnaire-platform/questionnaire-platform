import styled, { css, keyframes } from 'styled-components';

interface SpinnerProps {
  size?: number;
}

const rotation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div<SpinnerProps>`
  border-color: ${({ color }) => color || '#fff'};
  border-style: solid;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: ${rotation} 1.5s linear infinite;

  ${({ size }) => css`
    width: ${size}px;
    height: ${size}px;
    border-width: ${size! * 0.1};
  `}
`;

Spinner.defaultProps = {
  size: 50,
};

export default Spinner;
