import { PropsWithChildren } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useAdminProgress } from '@/api/hooks';
import { withUrlParams } from '@/api/util';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Flex from '@/components/Flex';
import Heading from '@/components/Heading';
import LinkButton from '@/components/LinkButton';
import Skeleton from '@/components/Skeleton';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { useAdminGroupsContext } from '@/features/AdminGroups/AdminGroupsContext';
import { Group } from '@/types';
import { getHierarchicalIdOfGroup } from '@/util';
import { useAppTheme } from '@/util/hooks';

import ActiveCategoryList from './ActiveCategoryList';

type GroupListItemProps = PropsWithChildren<{
  group: Group;
  order: number;
}>;

const ListItem = styled.li`
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  color: ${({ theme }) => theme.adminGroups.groupListItem?.fgColor};
  background: ${({ theme }) => theme.adminGroups.groupListItem?.bgColor};
  margin-bottom: 1rem;
`;

const ToGroupButton = styled(LinkButton)`
  margin-bottom: 24px;
`;

const GroupListDivider = styled(Divider)`
  margin-bottom: 0;
`;

const GroupPin = styled.div`
  padding-top: 16px;
  text-align: center;
`;

function GroupListItem({ group, order }: GroupListItemProps) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { organizations, questionnaire, config } = useAdminGroupsContext();
  const hierarchicalIdOfGroup = getHierarchicalIdOfGroup(organizations, group);
  const { data: progress, loading } = useAdminProgress(
    questionnaire,
    hierarchicalIdOfGroup
  );

  if (loading) {
    return (
      <Skeleton
        as={ListItem}
        width="100%"
        height={300}
        delay={250 * order}
        data-cy="list-item-loader"
      />
    );
  }

  return (
    <ListItem>
      <Container pv={16}>
        <Heading
          variant="h3"
          align="center"
          color={theme.adminGroups?.heading?.fgColor}
        >
          {group.name}
        </Heading>

        <Spacer as={Divider} color="eeeff1" m={0} mv={16} />

        <Flex direction="column" align="center">
          <Typography id={`admin-group-header-${group.id}`} as="h4">
            {t('adminGroups.activeCategories')}:
          </Typography>

          <Spacer mt={16} mb={24}>
            <ActiveCategoryList
              progress={progress}
              aria-describedby={`admin-group-header-${group.id}`}
            />
          </Spacer>

          <ToGroupButton
            slug={withUrlParams('admin/categories', {
              organizationIds: hierarchicalIdOfGroup.join(','),
            })}
            label={t('adminGroups.categoryLinkButtonLabel')}
            variant={config.buttonVariant}
            aria-label={`${t('adminGroups.categoryLinkButtonLabel')} ${
              group.name
            }`}
          />
        </Flex>

        <GroupListDivider color={theme.adminGroups?.divider} />

        <GroupPin as="div" data-cy="group-pin">
          <Trans
            i18nKey="adminGroups.groupPinCode"
            values={{ pin: group.pin }}
            components={{ bold: <Typography as="span" weight="bold" /> }}
          />
        </GroupPin>
      </Container>
    </ListItem>
  );
}

export default GroupListItem;
