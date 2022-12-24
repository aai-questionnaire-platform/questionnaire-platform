import * as util from './util';
import { User } from '../../types';

describe('GroupsList/util', () => {
  describe('toGroupDto', () => {
    describe('in create mode', () => {
      it('should return values', () => {
        const values = {
          name: 'name',
          organizationUuid: '1',
          groupAdmins: [] as User[],
        };

        expect(util.toGroupDto(values, false)).toEqual(values);
      });

      it('should not have id', () => {
        const values: any = { groupAdmins: [] };
        expect(util.toGroupDto(values, false).id).toEqual(undefined);
      });

      it('should have groupAdmins with group_ids', () => {
        const values: any = { groupAdmins: [{ id: '2', group_ids: ['1'] }] };
        expect(util.toGroupDto(values, false).groupAdmins).toEqual([
          { id: '2', group_ids: ['1'] },
        ]);
      });
    });

    describe('in edit mode', () => {
      it('should return values', () => {
        const values = {
          name: 'name',
          organizationUuid: '1',
          groupAdmins: [] as User[],
        };

        expect(util.toGroupDto(values, true)).toEqual(values);
      });

      it('should have an id', () => {
        const values: any = { groupAdmins: [] };
        const group: any = { id: '1' };
        expect(util.toGroupDto(values, true, group).id).toEqual('1');
      });

      it("should add group's id to the groupAdmins' list of groups only if not in the list", () => {
        const values: any = { groupAdmins: [{ id: '2', group_ids: ['1'] }] };
        const group: any = { uuid: '1' };
        expect(util.toGroupDto(values, true, group).groupAdmins).toEqual([
          { id: '2', group_ids: ['1'] },
        ]);
      });
    });
  });
});
