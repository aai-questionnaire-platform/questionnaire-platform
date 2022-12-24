import * as R from 'ramda';
import { toUserDto } from '../../util';
import { listGroupsDataLens, viewOr } from '../../util/lenses';
import { Group, Organization, User } from '../../types';

export type GroupFormValues = Pick<Group, 'name' | 'organizationUuid'> & {
  groupAdmins: User[];
};

export const getParentId = R.pipe<Organization[], Organization, string>(
  R.last,
  R.prop('uuid')
);

export function toGroupDto(
  values: GroupFormValues,
  isEditMode: boolean,
  group?: Group
) {
  return {
    ...values,
    ...(isEditMode && { id: group?.id, uuid: group?.uuid }),
    groupAdmins: values.groupAdmins.map(toUserDto),
  };
}

const nameToLower = R.pipe<Group, string, string>(R.prop('name'), R.toLower);
const sortGroups = R.sortBy(nameToLower);

export const getSortedGroupsFromQueryResponse = R.pipe<any, any, Group[]>(
  viewOr([], listGroupsDataLens),
  sortGroups
);
