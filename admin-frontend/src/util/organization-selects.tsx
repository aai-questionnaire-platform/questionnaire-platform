import MenuItem from '@mui/material/MenuItem';
import * as R from 'ramda';
import { ORGANIZATON_TYPE } from '../enums';
import { Organization } from '../types';

export const formAreaOptions = (type: ORGANIZATON_TYPE) =>
  R.pipe<Organization[], Organization[], Organization[], JSX.Element[]>(
    R.filter(R.propEq('type', type)),
    R.sortBy(R.prop('name')),
    R.map(asSelectOptions)
  );

export const formUnitOptions = (areaId?: string) =>
  R.ifElse(
    R.always(Boolean(areaId)),
    R.pipe<Organization[], Organization[], Organization[], JSX.Element[]>(
      R.filter(R.propEq('parentUuid', areaId)),
      R.sortBy(R.prop('name')),
      R.map(asSelectOptions)
    ),
    R.always([])
  );

const asSelectOptions = ({ uuid, name }: Organization) => (
  <MenuItem key={uuid} value={uuid}>
    {name}
  </MenuItem>
);

export const findByUuid = R.curry(
  (haystack: { uuid: string }[], uuid: string) =>
    R.find(R.propEq('uuid', uuid), haystack)
);
