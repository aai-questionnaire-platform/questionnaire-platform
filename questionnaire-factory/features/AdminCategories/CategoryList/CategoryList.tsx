import useSize from '@react-hook/size';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useUpdateCategoryState } from '@/api/hooks';
import { CategoryState } from '@/enums';
import DashedLine from '@/features/AdminCategories/DashedLine';
import { AdminCategoriesComponent } from '@/schema/Components';
import { CategoryWithProgress } from '@/types';
import { useAppTheme } from '@/util/hooks';

import CategoryListItem from './CategoryListItem';
import FeedbackListItem from './FeedbackListItem';
import {
  getCenterOfElement,
  resolveIfLockable,
  resolveIfUnlockable,
} from './util';

const List = styled.ul`
  position: relative;
`;

interface CategoryListProps {
  categories: CategoryWithProgress[];
  config: Omit<AdminCategoriesComponent['props'], 'children'>;
  organizationIds: string[];
  questionnaireId: string;
}

type Position = {
  x: number;
  y: number;
};

function CategoryList({
  categories = [],
  config,
  organizationIds,
  questionnaireId,
}: CategoryListProps) {
  const [linePos, setLinePos] = useState<{
    start: Position;
    end: Position;
  } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const size = useSize(listRef);
  const theme = useAppTheme();
  const { dispatch: updateCategoryState, loading: isActivating } =
    useUpdateCategoryState(organizationIds, questionnaireId);

  useEffect(() => {
    if (!listRef.current) return;

    const firstBadge = listRef.current.querySelector(
      `#category-state-badge-${categories[0].id}`
    );
    const lastBadge = listRef.current.querySelector(
      `#category-state-badge-${categories[categories.length - 1].id}`
    );

    if (!firstBadge || !lastBadge) return;

    const start = getCenterOfElement(firstBadge, listRef.current);
    const end = getCenterOfElement(lastBadge, listRef.current);

    setLinePos({ start, end });
  }, [categories, size]);

  const lockCategory = (categoryId: string) => {
    updateCategoryState({
      category_id: categoryId,
      status: CategoryState.LOCKED,
    });
  };

  const unlockCategory = (categoryId: string) => {
    updateCategoryState({
      category_id: categoryId,
      status: CategoryState.UNLOCKED,
    });
  };

  return (
    <>
      <DashedLine
        color={theme.adminCategories?.dashedLine}
        startPos={linePos?.start}
        endPos={linePos?.end}
      />
      <List ref={listRef} data-cy="admin-category-list">
        {categories.map((category) =>
          category.type === 'feedback' ? (
            <FeedbackListItem
              key={category.id}
              category={category}
              config={config}
              isActivating={isActivating}
              isUnlockable={resolveIfUnlockable(category, categories)}
              isLockable={resolveIfLockable(category, categories)}
              unlockCategory={unlockCategory}
              lockCategory={lockCategory}
            />
          ) : (
            <CategoryListItem
              key={category.id}
              category={category}
              organizationIds={organizationIds}
              config={config}
              isActivating={isActivating}
              isUnlockable={resolveIfUnlockable(category, categories)}
              isLockable={resolveIfLockable(category, categories)}
              unlockCategory={unlockCategory}
              lockCategory={lockCategory}
            />
          )
        )}
      </List>
    </>
  );
}

export default CategoryList;
