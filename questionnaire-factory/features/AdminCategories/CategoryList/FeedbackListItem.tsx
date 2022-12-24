import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Button from '@/components/Button';
import Divider from '@/components/Divider';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Icon from '@/components/Icon';
import Typography from '@/components/Typography';
import { CategoryState } from '@/enums';
import { AdminCategoriesComponent } from '@/schema/Components';
import { CategoryWithProgress } from '@/types';

import CategoryStateIndicator from './CategoryStateIndicator';

const ListItem = styled.li`
  display: flex;
  margin-bottom: 1rem;
`;

const Item = styled.div<{ isUnlocked: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-wrap: wrap;
  background-color: ${({ theme }) =>
    theme.adminCategories?.categoryListItem?.bgColor};
  border-radius: 0.75rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);

  ${({ isUnlocked }) =>
    isUnlocked &&
    css`
      border: 2px solid
        ${({ theme }) => theme.adminCategories?.categoryListItem?.activeBorder};
    `}
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
`;

const ItemHeading = styled(Heading)`
  padding: 0 1rem 1rem 0;
`;

const UndoButton = styled(Button)`
  padding: 0.5rem 0 0 0;
`;

const ItemDivider = styled(Divider)`
  margin: 0;
`;

const Description = styled(Typography)`
  padding: 0 1rem;
`;

export interface CategoryListItemProps {
  category: CategoryWithProgress;
  config: Omit<AdminCategoriesComponent['props'], 'children'>;
  isActivating: boolean;
  isLockable: boolean;
  isUnlockable: boolean;
  lockCategory: (id: string) => void;
  unlockCategory: (id: string) => void;
}

const FeedbackListItem = ({
  category,
  config,
  isActivating,
  isLockable,
  isUnlockable,
  lockCategory,
  unlockCategory,
}: CategoryListItemProps) => {
  const { t } = useTranslation();

  const isLocked = category.state === CategoryState.LOCKED;
  const isUnlocked = category.state === CategoryState.UNLOCKED;

  return (
    <ListItem data-cy={`admin-categories-feedback-${category.id}`}>
      <CategoryStateIndicator
        id={`category-state-badge-${category.id}`}
        config={config}
        state={category.state}
        categoryType={category.type}
      />
      <Item isUnlocked={isUnlocked}>
        <ItemContent>
          <Flex direction="column">
            <ItemHeading
              variant="h2"
              id={`category-list-heading-${category.id}`}
            >
              {category.description}
            </ItemHeading>

            {isLockable && (
              <UndoButton
                variant="flat"
                startIcon={<Icon icon="undo" size={12} />}
                onClick={() => lockCategory(category.id)}
                data-cy={`undo-activation-button-${category.id}`}
              >
                {t('adminCategories.undoActivation')}
              </UndoButton>
            )}
          </Flex>

          <Flex direction="row" align="center" wrap="wrap">
            {isLocked && (
              <Button
                aria-describedby={`category-list-heading-${category.id}`}
                data-cy={`unlock-category-button-${category.id}`}
                onClick={() => unlockCategory(category.id)}
                disabled={!isUnlockable || isActivating}
              >
                {t('adminCategories.unlockLevel')}
              </Button>
            )}
          </Flex>
        </ItemContent>

        <ItemDivider />

        <Description>{t('adminCategories.feedbackDescription')}</Description>
      </Item>
    </ListItem>
  );
};

export default FeedbackListItem;
