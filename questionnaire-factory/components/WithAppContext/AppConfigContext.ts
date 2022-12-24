import { createContext, useContext, Context } from 'react';

import { AppMeta } from '@/schema/AppStructure';

export const AppConfigContext: Context<AppMeta> = createContext({} as AppMeta);

export const useAppConfig = () => useContext(AppConfigContext);
