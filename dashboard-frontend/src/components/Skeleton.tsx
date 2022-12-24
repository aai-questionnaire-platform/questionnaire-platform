import styled, { css, keyframes } from 'styled-components';

const pulseLight = keyframes`
  to {
    background-color: rgba(255, 255, 255, 0.03);
  }
`;

const pulseDark = keyframes`
  to {
    background-color: rgba(0, 0, 0, 0.075);
  }
`;

interface SkeletonProps {
  animation?: 'pulse-light' | 'pulse-dark' | 'none';
  color?: string;
  height?: number | string;
  width?: number | string;
  variant?: 'circle' | 'rect';
  delay?: number;
}

const Skeleton = styled.div<SkeletonProps>`
  position: relative;
  height: ${({ height }) =>
    typeof height === 'string' ? height : `${height}px`};
  width: ${({ width }) => (typeof width === 'string' ? width : `${width}px`)};
  border-radius: ${({ variant }) => (variant === 'circle' ? '50%' : '0.5rem')};
  overflow: hidden;
  background-color: ${({ color }) => color};

  ${({ animation, delay }) =>
    animation !== 'none' &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        animation: ${animation === 'pulse-light' ? pulseLight : pulseDark} 0.8s
          ease-in-out infinite;
        animation-direction: alternate;
        animation-delay: ${delay}ms;
      }
    `}
`;

Skeleton.defaultProps = {
  animation: 'pulse-dark',
  color: 'transparent',
  height: 100,
  width: 100,
  variant: 'rect',
  delay: 0,
};

export default Skeleton;
