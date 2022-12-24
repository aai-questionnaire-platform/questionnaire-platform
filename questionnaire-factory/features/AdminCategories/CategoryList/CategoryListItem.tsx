import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { withUrlParams } from '@/api/util';
import Button from '@/components/Button';
import Collapsible from '@/components/Collapsible';
import Divider from '@/components/Divider';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import Icon from '@/components/Icon';
import LinkButton from '@/components/LinkButton';
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
  color: ${({ theme }) => theme.adminCategories.categoryListItem.fgColor};
  background: ${({ theme }) => theme.adminCategories.categoryListItem.bgColor};
  border-radius: 0.75rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);

  ${({ isUnlocked }) =>
    isUnlocked &&
    css`
      border: 2px solid
        ${({ theme }) => theme.adminCategories.categoryListItem.activeBorder};
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
  padding-right: 1rem;
`;

const UndoButton = styled(Button)`
  padding: 0.5rem 0 0 0;
`;

const TopicCovered = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  & > p {
    padding-left: 1rem;
    margin: 0;
  }
`;

const CompletionStatistics = styled(Typography)`
  padding-right: 1rem;
`;

const ItemDivider = styled(Divider)`
  margin: 0;
  border-color: ${({ theme }) => theme.adminCategories.divider};
`;

export interface CategoryListItemProps {
  category: CategoryWithProgress;
  config: Omit<AdminCategoriesComponent['props'], 'children'>;
  organizationIds: string[];
  isActivating: boolean;
  isLockable: boolean;
  isUnlockable: boolean;
  lockCategory: (id: string) => void;
  unlockCategory: (id: string) => void;
}

const CategoryListItem = ({
  category,
  config,
  organizationIds,
  isActivating,
  isLockable,
  isUnlockable,
  lockCategory,
  unlockCategory,
}: CategoryListItemProps) => {
  const { t } = useTranslation();

  const isLocked = category.state === CategoryState.LOCKED;
  const isUnlocked = category.state === CategoryState.UNLOCKED;
  const isApproved = category.state === CategoryState.APPROVED;

  return (
    <ListItem data-cy={`admin-categories-category-${category.id}`}>
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

            {isApproved && (
              <TopicCovered>
                <Icon
                  icon="lock"
                  size={13}
                  alt={t('adminCategories.topicCovered')}
                />
                <Typography>{t('adminCategories.topicCovered')}</Typography>
              </TopicCovered>
            )}
          </Flex>

          <Flex direction="row" align="center" wrap="wrap">
            <CompletionStatistics>
              {t('adminCategories.categoryCompletionStatistics', {
                completionCount: category.completionCount!,
                groupMemberCount: category.groupMemberCount!,
              })}
            </CompletionStatistics>

            {isLocked ? (
              <Button
                aria-describedby={`category-list-heading-${category.id}`}
                data-cy={`unlock-category-button-${category.id}`}
                onClick={() => unlockCategory(category.id)}
                disabled={!isUnlockable || isActivating}
                variant={config.buttonVariant}
              >
                {t('adminCategories.unlockLevel')}
              </Button>
            ) : (
              <LinkButton
                label={t('adminCategories.seeAnswers')}
                slug={withUrlParams('admin/answersummary', {
                  categoryId: category.id,
                  organizationIds: organizationIds.join(','),
                })}
                variant={config.buttonVariant}
                aria-describedby={`category-list-heading-${category.id}`}
                data-cy={`answers-button-${category.id}`}
              />
            )}
          </Flex>
        </ItemContent>

        <ItemDivider />

        <Collapsible
          heading={
            <Typography variant="default" as="h3" weight={500}>
              {t('adminCategories.seeQuestions', {
                count: category.questions.length,
              })}
            </Typography>
          }
        >
          {category.questions.map((question: any, index: number) => (
            <Typography
              data-cy={`question-preview-text-${index}`}
              key={index}
              variant="small"
            >
              {`${index + 1}. ${question.label}${
                question.maxSelectedOptions && question.maxSelectedOptions > 1
                  ? ` (${t('adminCategories.multipleChoice')})`
                  : ''
              }`}
            </Typography>
          ))}
        </Collapsible>
      </Item>
    </ListItem>
  );
};

export default CategoryListItem;
