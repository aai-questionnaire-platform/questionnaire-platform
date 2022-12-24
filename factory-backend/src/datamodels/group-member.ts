import { Group } from './organizations';

export interface GroupMember {
  /**
   * Id of the group the member belongs to
   */
  group_id: string;

  /**
   * Id of the member
   */
  user_id: string;
}

/**
 * Post request body for linking a user and a group
 */
export interface PostGroupMemberRequestBody {
  user_id: string;
  group: Group;
}
