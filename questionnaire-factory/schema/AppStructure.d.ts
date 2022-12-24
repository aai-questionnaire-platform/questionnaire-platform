import { ComponentDefinition } from './Components';

/**
 * Application level meta information
 */
interface AppMeta {
  /**
   * Top level title, by default the title of each subpage is prefixed with this title
   */
  title: string;
  /**
   * Application language code
   * @example fi/sv/en
   */
  lang: string;
  /**
   * Games can also have arbitrary meta information. Usage requires game specific logic and should be avoided.
   */
  [key: string]: unknown;
}

/**
 * Authentication properties
 */
export interface AuthDef {
  /**
   * User roles that are permitted to access this route.
   * @example mmk-rs/questionnaire:approve
   * @example mmk-rs/questionnaire:play
   */
  roles: string[];
}

/**
 * Route specific meta information
 */
interface RouteMeta {
  /**
   * Authentication properties. If false, the page requires no authentication and will be public.
   * Note that if the page makes api requests, the requests are validated on the server, and thus
   * the route can't be public.
   *
   * @example { roles: ['mmk-rs/questionnaire:play'] }
   */
  auth: AuthDef | false;

  /**
   * Subpage title. Will be prefixed with the app level title.
   * @example My subtitle -> My app title - My subtitle
   */
  title?: string;
}

/**
 *  Route configuration schema
 */
export interface AppRoute {
  /**
   * Route level meta information
   */
  meta: RouteMeta;
  /**
   * Route url path
   * @example /examples
   */
  path: string;
  /**
   * The feature/component this route maps to. Can be a list of components but
   * mostly each route just maps to a single feature level component
   */
  children?: ComponentDefinition[];
}

/**
 *  Application configuration schema
 */
export interface AppStructure {
  meta: AppMeta;
  routes: AppRoute[];
}
