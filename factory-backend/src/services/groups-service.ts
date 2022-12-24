import {
  getGroupFromTable,
  getGroupsFromTable,
} from '../aws-wrappers/get-item-from-table';
import { insertGroupToTable } from '../aws-wrappers/insert-item-to-table';
import { updateGroupInTable } from '../aws-wrappers/update-item-in-table';
import { ValidationError } from '../datamodels/error/validation-error';
import { Group, PostGroupRequestBody } from '../datamodels/organizations';

export class GroupsService {
  constructor(public groupsTableName: string) {}

  /**
   * Create the group
   * @param parentOrganizationId
   * @param group
   */
  async createNewGroup(group: PostGroupRequestBody) {
    //Verify that the organization with same name has not been already defined
    const checks = [
      this.getGroupByName(group.parent_organization_id, group.name),
      this.getGroupByPin(group.pin),
    ];
    const results = await Promise.all(checks);

    if (results.filter(Boolean).length) {
      throw new Error(`Group violates an unique constraint`);
    }

    console.info('Creating group', group);

    //Insert the group
    await insertGroupToTable(this.groupsTableName, group);

    console.info('Group created successfully!');
  }

  async updateGroup(group: Group) {
    console.info('updateGroup(): Updating group', JSON.stringify(group));

    const existing = await this.getGroup(group);

    console.debug('updateGroup(): Previous values', JSON.stringify(existing));

    if (!existing) {
      throw new ValidationError('Group update failed: no such group');
    }

    const update = await updateGroupInTable(this.groupsTableName, group);

    console.info('updateGroup(): Group updated successfully!');

    return update;
  }

  /**
   * Get a group by it's name and parent organization's id
   * @private
   * @param parentOrganizationId
   * @param name
   */
  private async getGroupByName(
    parentOrganizationId: string,
    name: string
  ): Promise<Group | undefined> {
    return getGroupFromTable(
      this.groupsTableName,
      'organization_name-index',
      'parent_organization_id',
      parentOrganizationId,
      'organization_name',
      name
    );
  }

  /**
   * Gets valid (with valid until/from matching the current date) groups for the given organization
   * @param parentOrganizationId
   */
  async getGroupsByParentId(
    parentOrganizationId: string
  ): Promise<Group[] | undefined> {
    console.info(
      'getGroupsByParentId(): searching groups by parent id',
      parentOrganizationId
    );

    return getGroupsFromTable(
      this.groupsTableName,
      'valid_until',
      'parent_organization_id',
      parentOrganizationId
    );
  }

  /**
   * Gets valid (with valid until/from matching the current date) group by pin
   * @param pin
   */
  async getGroupByPin(pin: string): Promise<Group | undefined> {
    console.info('getGroupByPin(): searching groups by pin code', pin);
    return getGroupFromTable(
      this.groupsTableName,
      'pin-code-index',
      'pin',
      pin
    );
  }

  async getGroup(group: Group) {
    console.info(
      'getGroup(): fetching group by parent_id, group_id',
      group.parent_organization_id,
      group.id
    );

    return getGroupFromTable(
      this.groupsTableName,
      undefined,
      'parent_organization_id',
      group.parent_organization_id,
      'organization_id',
      group.id
    );
  }
}
