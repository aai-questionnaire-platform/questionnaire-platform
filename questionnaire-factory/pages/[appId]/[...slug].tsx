import type { NextPage } from 'next';

import ComponentTree from '@/components/ComponentTree';
import WithAppContext from '@/components/WithAppContext';
import { AppStaticProps } from '@/types';
import {
  getStaticPathsForRoute,
  getStaticPropsForRoute,
} from '@/util/server-utils';

const AppPage: NextPage<AppStaticProps> = ({ routeProps }) => {
  return <ComponentTree tree={routeProps?.children} />;
};

export const getStaticProps = getStaticPropsForRoute;
export const getStaticPaths = getStaticPathsForRoute({ root: false });

export default WithAppContext(AppPage);
