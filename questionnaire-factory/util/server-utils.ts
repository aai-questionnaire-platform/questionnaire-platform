/**
 *
 * @module ServerUtils
 *
 * This module contains all the utility functions that are used on SERVER SIDE ONLY!
 * So functions in this file should only be called from getStatic* or getServerSide* functions.
 *
 */
import childProcess from 'child_process';
import fs from 'fs';
import type { GetStaticPaths, GetStaticProps } from 'next/types';
import path from 'path';
import * as R from 'ramda';

import errorTranslations from '@/assets/error.translations.json';
import type { AppRoute, AppStructure } from '@/schema/AppStructure';

const getRouteProps = (routes: AppRoute[], pathname: string): AppRoute =>
  R.find(R.propEq('path', pathname), routes) ?? ({} as AppRoute);

const readJSON = (fileName: string) => {
  const contents = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(contents);
};

const readSettings = (appId: string): AppStructure => {
  const fileName = path.join(process.cwd(), 'assets', `${appId}.app.json`);
  return readJSON(fileName);
};

const readTheme = (appId: string) => {
  const fileName = path.join(process.cwd(), 'assets', `${appId}.theme.json`);
  return readJSON(fileName);
};

const readTranslations = (appId: string) => {
  const fileName = path.join(
    process.cwd(),
    'assets',
    `${appId}.translations.json`
  );
  return readJSON(fileName);
};

const readPackageJSON = () => {
  const fileName = path.join(process.cwd(), 'package.json');
  return readJSON(fileName);
};

const readBuildId = () => {
  return childProcess.execSync('git rev-parse --short HEAD').toString().trim();
};

/**
 * Get static route specific props and app wide props on build time
 * @async
 * @param getStaticPropsContext
 * @returns
 */
export const getStaticPropsForRoute: GetStaticProps = async ({
  params = {},
}) => {
  const appId = params.appId as string;
  const slug = Array.isArray(params.slug)
    ? params.slug.join('/')
    : params.slug ?? '/';
  const appProps = R.assocPath(['meta', 'appId'], appId, readSettings(appId));
  const theme = readTheme(appId);
  const translations = R.mergeDeepLeft(
    readTranslations(appId),
    errorTranslations
  );
  const routeProps = getRouteProps(appProps.routes, slug);
  const tag = readPackageJSON().version;
  const hash = readBuildId();
  const version = `${tag}-${hash}`;

  return {
    props: {
      appProps: { ...appProps, translations, version },
      routeProps: { ...routeProps, theme },
    },
  };
};

const appIdFromFileName = (fileName: string) => {
  const [, appId] = fileName.match(/^(.+)\.app\.json$/) ?? [];
  return appId;
};

const resolveAppRoutes = (appId: string) => {
  const appConfig = readSettings(appId);
  return appConfig.routes.map(R.prop('path'));
};

const isAppFile = (fileName: string) => /^.+\.app\.json$/.test(fileName);

const resolveAllAppPaths = () => {
  const assetsLocation = path.join(process.cwd(), 'assets');
  const fileNames = fs.readdirSync(assetsLocation).filter(isAppFile);
  const appIds = fileNames.map(appIdFromFileName);
  const appRoutes = appIds.map(resolveAppRoutes);
  return R.zipObj(appIds, appRoutes);
};

const generateRoutes = ([appId, routes]: [string, string[]]) =>
  routes
    .filter((pathname) => pathname !== '/')
    .map((pathname) => ({
      params: { appId, slug: pathname.split('/') },
    }));

const generateRootRoutes = ([appId]: [string, string[]]) => [
  { params: { appId } },
];

/**
 * Generate static paths definitions for all apps and their subpaths on build time
 * @async
 * @returns
 */
export const getStaticPathsForRoute =
  ({ root }: { root: boolean }): GetStaticPaths =>
  async () => {
    const apps = resolveAllAppPaths();
    const paths = Object.entries(apps)
      .map(root ? generateRootRoutes : generateRoutes)
      .flat();
    return { paths, fallback: false };
  };
