import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Flex from '@/components/Flex';

import StepIndex from './StepIndex';

interface CategoryProgressTrackerProps {
  activeStep: number;
  totalSteps: number;
  type: 'bar' | 'dot';
}

const ProgressTrackerWrapper = styled(Flex)`
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
`;

ProgressTrackerWrapper.defaultProps = {
  justify: 'space-evenly',
  align: 'center',
};

const Progress = styled.div<{ percent: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 0;
  width: ${R.prop('percent')}%;
  background: ${({ theme }) =>
    theme.category.categoryProgressTracker.active.bgColor};
  border-radius: 0 12px 12px 0;
`;

function CategoryProgressTracker({
  activeStep: activeStepZeroIndexed,
  totalSteps,
  type,
}: CategoryProgressTrackerProps) {
  const { t } = useTranslation();
  const activeStep = activeStepZeroIndexed + 1;
  const isLastQuestion = activeStep === totalSteps;
  const progressPercentage = Math.ceil(
    (activeStep / totalSteps) * 100 + (isLastQuestion ? 2 : 0)
  );

  return (
    <ProgressTrackerWrapper
      role="progressbar"
      aria-valuenow={activeStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      tabIndex={-1}
      aria-label={t('category.questionNumber')}
      data-cy="category-progress-tracker"
    >
      {type === 'bar' && <Progress percent={progressPercentage} />}

      {R.range(1, totalSteps + 1).map((i) => (
        <StepIndex
          key={i}
          step={i}
          isVisited={i <= activeStep}
          isActive={activeStep === i}
          type={type}
        />
      ))}
    </ProgressTrackerWrapper>
  );
}

export default CategoryProgressTracker;
