import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import * as R from 'ramda';
import { LIST_ORGANIZATIONS } from '../api/queries';
import { listOrganizationsDataLens } from '../util/lenses';
import { findByUuid } from '../util/organization-selects';
import { Organization } from '../types';
import Error from './Error';
import GroupsList from './GroupsList';
import Loader from './Loader';

interface GroupsTabProps {
  area: Organization;
  unit: Organization;
}

const GroupsTab = ({ area, unit }: GroupsTabProps) => {
  const { data, error, loading } = useQuery(LIST_ORGANIZATIONS);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const organizations: Organization[] = R.view(listOrganizationsDataLens, data);

  const findOrganization = findByUuid(organizations);

  return (
    <Box data-cy="groups-form-groups-section" pb={12}>
      <GroupsList
        organizationHierarchy={[
          findOrganization(area.uuid),
          findOrganization(unit.uuid),
        ]}
      />
    </Box>
  );
};

export default GroupsTab;
