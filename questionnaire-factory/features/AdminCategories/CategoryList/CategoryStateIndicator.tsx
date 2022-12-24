import { useTranslation } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { CategoryState } from '@/enums';
import { AdminCategoriesComponent } from '@/schema/Components';

interface CategoryStateIndicatorProps {
  config: Omit<AdminCategoriesComponent['props'], 'children'>;
  id: string;
  state: CategoryState;
  categoryType?: string;
}

const pulse = ({ theme }: { theme: Record<string, any> }) => keyframes`
  to {
    box-shadow: 0 0 24px ${theme.progress?.progressButton.active.fgColor}66;
  }
`;

const Indicator = styled.div<{ active: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 56px;
  width: 56px;
  border-radius: 50%;
  margin-right: 0.75rem;
  background-color: #fff;
  box-shadow: 0px 0.5px 4px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1);

  ${({ active }) =>
    active &&
    css`
      animation: ${pulse} 1s ease-in-out infinite;
      animation-direction: alternate;
    `}
`;

const CategoryStateIndicator = ({
  categoryType,
  config,
  state,
  ...rest
}: CategoryStateIndicatorProps) => {
  const { t } = useTranslation();

  const locked = state === CategoryState.LOCKED;
  const approved = state === CategoryState.APPROVED;

  const { activeIcon, doneIcon, lockedIcon } = config.icons;
  const icon = locked ? lockedIcon : approved ? doneIcon : activeIcon;

  const label = t(
    locked
      ? 'adminCategories.categoryLocked'
      : approved
      ? 'adminCategories.categoryApproved'
      : 'adminCategories.categoryActive'
  );

  return (
    <Indicator {...rest} active={state === CategoryState.UNLOCKED}>
      <img src={icon} alt={label} />
    </Indicator>
  );
};

export default CategoryStateIndicator;
