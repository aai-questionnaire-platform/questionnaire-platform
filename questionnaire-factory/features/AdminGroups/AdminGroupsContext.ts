import { Context, createContext, useContext } from 'react';

import { AdminGroupsComponent } from '@/schema/Components';
import { Group, Organization, Questionnaire } from '@/types';

interface IAdminGroupsContext {
  questionnaire: Questionnaire;
  config: Omit<AdminGroupsComponent['props'], 'children'>;
  organizations: Organization[];
  groups: Group[];
}

export const AdminGroupsContext: Context<IAdminGroupsContext> = createContext(
  {} as IAdminGroupsContext
);

export const useAdminGroupsContext = () => useContext(AdminGroupsContext);
