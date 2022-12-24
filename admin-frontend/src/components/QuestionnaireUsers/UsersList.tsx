import { useQuery, useReactiveVar } from '@apollo/client';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useFetchUsersHook } from '../../api/hooks';
import { LIST_GROUPS } from '../../api/queries';
import { usersVar } from '../../api/reactiveVars';
import { sortUsers } from '../../util';
import { listGroupsDataLens, viewOr } from '../../util/lenses';
import { Group, Organization, User } from '../../types';
import Error from '../Error';
import Loader from '../Loader';
import AddUsersSection from './AddUsersSection';
import EditableUserEntry from './EditableUserEntry';

interface UsersListProps {
  area: Organization;
  unit: Organization;
}

const UsersList = ({ area, unit }: UsersListProps) => {
  const { t } = useTranslation();
  const users = useReactiveVar(usersVar);
  const { data, loading, error } = useQuery(LIST_GROUPS, {
    variables: { parentId: unit.uuid },
  });
  const { loading: isUsersloading } = useFetchUsersHook(unit.uuid);

  if (error) {
    return <Error error={error} />;
  }

  if (loading || isUsersloading) {
    return (
      <Box py={4}>
        <Loader />
      </Box>
    );
  }

  const groups: Group[] = viewOr([], listGroupsDataLens, data);

  return (
    <Box pb={12}>
      {users.length ? (
        <List aria-label={t('usersInUnit')} data-cy="user-management-user-list">
          {sortUsers(users).map((user: User) => (
            <EditableUserEntry
              key={user.email}
              user={user}
              groups={groups}
              organizationHierarchy={[area, unit]}
              removable={false}
            />
          ))}
        </List>
      ) : (
        <Typography sx={{ pb: 2, pt: 2 }}>{t('noUsersFoundInUnit')}</Typography>
      )}

      <AddUsersSection areaName={area.name} unit={unit} />
    </Box>
  );
};

export default UsersList;
