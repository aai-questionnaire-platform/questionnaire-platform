import { useQuery } from '@apollo/client';
import Grid from '@mui/material/Grid';
import { SelectChangeEvent } from '@mui/material/Select';
import * as R from 'ramda';
import { useTranslation } from 'react-i18next';
import { LIST_ORGANIZATIONS } from '../../api/queries';
import { listOrganizationsDataLens } from '../../util/lenses';
import {
  formAreaOptions,
  formUnitOptions,
} from '../../util/organization-selects';
import Dropdown from '../../components/Dropdown';
import Error from '../../components/Error';
import Loader from '../../components/Loader';
import { ORGANIZATON_TYPE } from '../../enums';
import { Organization } from '../../types';

interface OrganizationSelectProps {
  area?: Organization;
  unit?: Organization;
  onAreaSelect: (arg: Organization | undefined) => void;
  onUnitSelect: (arg: Organization | undefined) => void;
}

const OrganizationSelect = ({
  area,
  unit,
  onAreaSelect,
  onUnitSelect,
}: OrganizationSelectProps) => {
  const { t } = useTranslation();

  const { loading, error, data } = useQuery(LIST_ORGANIZATIONS);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error} />;
  }

  const organizations: Organization[] = R.view(listOrganizationsDataLens, data);

  const handleAreaChange = (event: SelectChangeEvent<any>) => {
    const org = organizations.find(R.propEq('uuid', event?.target.value));
    onAreaSelect(org);
    onUnitSelect(undefined);
  };

  const handleUnitChange = (event: SelectChangeEvent<any>) => {
    const org = organizations.find(R.propEq('uuid', event?.target.value));
    onUnitSelect(org);
  };

  return (
    <Grid container spacing={2}>
      <Grid item sm={12} md={6}>
        <Dropdown
          name="area"
          label={t('chooseArea')}
          value={area?.uuid ?? ''}
          onChange={handleAreaChange}
          fullWidth
        >
          {formAreaOptions(ORGANIZATON_TYPE.AREA)(organizations)}
        </Dropdown>
      </Grid>

      <Grid item sm={12} md={6}>
        <Dropdown
          name="unit"
          label={t('chooseUnit')}
          value={unit?.uuid ?? ''}
          onChange={handleUnitChange}
          disabled={!area}
          fullWidth
        >
          {formUnitOptions(area?.uuid ?? '')(organizations)}
        </Dropdown>
      </Grid>
    </Grid>
  );
};

export default OrganizationSelect;
