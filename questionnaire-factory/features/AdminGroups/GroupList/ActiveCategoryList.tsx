import { HTMLProps } from 'react';
import styled from 'styled-components';

import Flex from '@/components/Flex';
import Typography from '@/components/Typography';
import { Progress } from '@/types';

import { useAdminGroupsContext } from '../AdminGroupsContext';
import { findActiveCategories } from '../util';

type ActiveCategoryListProps = HTMLProps<HTMLUListElement> & {
  progress: Progress;
};

const ListItem = styled.li`
  padding: 0.25rem 0.5rem;
  margin-bottom: 1rem;
  border-radius: 90px;
  color: ${({ theme }) => theme.adminGroups?.activeCategoryListItem.fgColor};
  background: ${({ theme }) =>
    theme.adminGroups?.activeCategoryListItem.bgColor};

  &:not(:last-child) {
    margin-right: 0.5rem;
  }
`;

function ActiveCategoryList({ progress, ...rest }: ActiveCategoryListProps) {
  const { questionnaire } = useAdminGroupsContext();
  const active = findActiveCategories(progress, questionnaire.categories);

  return (
    <Flex
      as="ul"
      {...(rest as any)}
      justify="center"
      wrap="wrap"
      data-cy="active-category-list"
      style={{ marginBottom: '-1rem' }}
    >
      {active.map((category) => (
        <ListItem key={category.id}>
          <Typography as="span" variant="small" align="center">
            {category.description}
          </Typography>
        </ListItem>
      ))}
    </Flex>
  );
}

export default ActiveCategoryList;
