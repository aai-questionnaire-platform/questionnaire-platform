import { useTranslation } from 'react-i18next';

import { useGroupMembers } from '@/api/hooks';
import Container from '@/components/Container';
import Divider from '@/components/Divider';
import Heading from '@/components/Heading';
import Spacer from '@/components/Spacer';
import Typography from '@/components/Typography';
import { useAppTheme } from '@/util/hooks';

import { useAdminGroupsContext } from './AdminGroupsContext';
import GroupList from './GroupList';
import WithAdminGroupsContext from './WithAdminGroupsContext';

function AdminGroups() {
  const { t } = useTranslation();
  const { questionnaire, groups = [] } = useAdminGroupsContext();
  const theme = useAppTheme();
  const groupIds = groups.map((group) => group.id);
  const { data } = useGroupMembers(groupIds);

  return (
    <>
      <Heading variant="h1">{questionnaire.title}</Heading>

      {!!groups.length && data?.groupMembers !== undefined && (
        <Typography data-cy="user-count">
          {t('adminGroups.body', {
            groupCount: groups.length,
            memberCount: data.groupMembers,
          })}
        </Typography>
      )}

      <Spacer mt={32} />

      <Divider color={theme.adminGroups?.divider} />

      <Container>
        <GroupList groups={groups} />
      </Container>
    </>
  );
}

export default WithAdminGroupsContext(AdminGroups);
