import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Icon from '@/components/Icon';
import { CategoryState } from '@/enums';

import { useProgressContext } from '../ProgressContext';
import ProgressButton from './ProgressButton';

const Label = styled.span`
  font-size: 2rem;
  font-weight: 500;
`;

interface CategoryButtonProps {
  index: number;
  state: CategoryState;
  categoryId: string;
}

const CategoryButton = ({ index, state, categoryId }: CategoryButtonProps) => {
  const { config } = useProgressContext();
  const router = useRouter();
  const { t } = useTranslation();

  const { link } = config.category.categoryButton;
  const active = state === CategoryState.UNLOCKED;
  const disabled = state === CategoryState.LOCKED;

  const handleClick = () => {
    router.push(`/${router.query.appId}/${link.slug}?id=${categoryId}`);
  };

  return (
    <ProgressButton
      aria-label={
        disabled
          ? t('category.categoryLocked', { categoryId })
          : `${t('category.category')} ${categoryId}`
      }
      data-cy={`category-button-${categoryId}`}
      active={active}
      disabled={disabled}
      onClick={handleClick}
      size={104}
      state={state}
    >
      {disabled ? (
        <Icon icon="lock" alt="" size={20} data-cy="category-locked-icon" />
      ) : (
        <Label>{index + 1}</Label>
      )}
    </ProgressButton>
  );
};

export default CategoryButton;
