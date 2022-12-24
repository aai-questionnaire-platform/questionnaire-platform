import { getGroupMembersFromTable } from '../aws-wrappers/get-item-from-table';
import { insertGroupMemberToTable } from '../aws-wrappers/insert-item-to-table';
import { removeGroupMemberBinding } from '../aws-wrappers/remove-item-from-table';
import { GroupMember } from '../datamodels/group-member';
import { Group } from '../datamodels/organizations';
import { OrganizationService } from './organization-service';
import { UserSettingsService } from './user-settings-service';

export class GroupMembersService {
  constructor(private tableName: string) {}

  /**
   * Find all group members belonging to the given group
   * @param groupId
   * @returns
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const result = await getGroupMembersFromTable(this.tableName, groupId);

    console.info(
      'getGroupMembers(): found',
      result.length,
      'members for group',
      groupId
    );

    return result;
  }

  /**
   * Form a link between user and a group. Also save the organizational structure to user's settings.
   * Organizational structure is a list of organization ids from top level to the group itself.
   * @param userId
   * @param group
   * @param settingsTableName
   * @param assetsBucketName
   */
  async addMemberToGroup(
    userId: string,
    group: Group,
    settingsTableName: string,
    assetsBucketName: string
  ) {
    try {
      console.info(
        'Adding user',
        userId,
        'to group',
        group.id,
        'in table',
        this.tableName
      );

      const organizationHierarchy = await new OrganizationService(
        assetsBucketName
      ).resolveOrganizationHierarchyTo(group.parent_organization_id);

      // wait for success to prevent mismatched data
      await new UserSettingsService(settingsTableName).saveUserSettings(
        userId,
        {
          organization_hierarchy: organizationHierarchy.concat(group.id),
        }
      );

      return insertGroupMemberToTable(this.tableName, {
        group_id: group.id,
        user_id: userId,
      });
    } catch (error) {
      console.error('addMemberToGroup():', error);
      throw error;
    }
  }

  async removeMemberFromGroup(group_id: string, user_id: string) {
    try {
      console.info('Removing member', user_id, 'from group', group_id);
      await removeGroupMemberBinding(this.tableName, group_id, user_id);
    } catch (error) {
      console.error('removeMemberFromGroup():', error);
      throw error;
    }
  }
}
