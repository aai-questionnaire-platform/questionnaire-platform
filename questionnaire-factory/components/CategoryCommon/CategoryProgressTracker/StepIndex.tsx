import styled, { css } from 'styled-components';

interface StepIndexProps {
  step: number;
  isVisited: boolean;
  isActive: boolean;
  type: 'bar' | 'dot';
}

const StepIndexWrapper = styled.div`
  display: block;
  width: 100%;
  background: ${({ theme }) =>
    theme.category.categoryProgressTracker.default.bgColor};
  text-align: center;
`;

const Step = styled.div<Omit<StepIndexProps, 'step'>>`
  position: relative;
  z-index: 1;
  color: ${({ isVisited, theme }) =>
    isVisited
      ? theme.category.categoryProgressTracker.active.fgColor
      : theme.category.categoryProgressTracker.default.fgColor};
  margin: 4px 0;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  ${({ type, theme }) =>
    type === 'dot' &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;

      background: ${theme.category.categoryProgressTracker.default.bgColor};
      border-radius: 50%;
      height: 30px;
      width: 30px;
    `}

  ${({ type, theme, isActive }) =>
    type === 'dot' &&
    isActive &&
    css`
      background: ${theme.category.categoryProgressTracker.active.bgColor};
      border: 1px solid ${theme.category.categoryProgressTracker.active.fgColor};
    `}
`;

function StepIndex({ step, isVisited, isActive, type }: StepIndexProps) {
  return (
    <StepIndexWrapper>
      <Step isVisited={isVisited} type={type} isActive={isActive}>
        {step}
      </Step>
    </StepIndexWrapper>
  );
}

export default StepIndex;
