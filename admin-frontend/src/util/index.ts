import { ModalProps } from '@mui/material/Modal';
import * as R from 'ramda';
import { KeyboardEvent } from 'react';
import { User } from '../types';

type EventLike = {
  preventDefault: VoidFunction;
  stopPropagation: VoidFunction;
};

/**
 * Higher order event handler function that prevents the default handler from
 * firing and calls the given callback.
 * @param f
 */
export const preventDefault = (f?: Function) => (e: EventLike) => {
  e.preventDefault();
  f?.(e);
  return e;
};

/**
 * Higher order event handler function that stops the event propagation and calls the given callback.
 * @param f
 */
export const stopPropagation = (f?: Function) => (e: EventLike) => {
  e.stopPropagation();
  f?.(e);
  return e;
};

/**
 * Higher order event handler function combining both preventDefault and stopPropagation
 * @param f
 */
export const stopEvent = (f?: Function) =>
  R.pipe(preventDefault(R.identity), stopPropagation(f));

/**
 * Filter by key code and run the given function if key is enter or space
 * @param fn
 */
export const onEnterOrSpace = (fn: Function) => (e: KeyboardEvent) => {
  if (e.code === 'Enter' || e.code === 'Space') {
    fn(e);
  }
};

export const focusOn = (selector: string) => {
  const elem = document.querySelector(selector) as HTMLInputElement;
  elem?.focus();
};

/**
 * Form url params from location.search string
 * @param search
 */
export const getUrlParams = (search: string) => new URLSearchParams(search);

/**
 * Get url search parameter value from location.search
 * @param search
 * @param param
 */
export const getUrlParam = (search: string, param: string) =>
  getUrlParams(search).get(param);

/**
 * Find component by it's display name
 */
export const findByDisplayName = R.pathEq(['type', 'displayName']);

let uid = 0;
/**
 * Return a number from a sequence. The number is unique per app run and not persistent.
 * @example
 *   uniqueId() // 1
 *   uniqueId('my-prefix') // 'my-prefix-2'
 * @param prefix
 * @returns
 */
export const uniqueId = (prefix: string = '') => `${prefix}-${uid++}`;

export const getEnvVariable = (name: string): string =>
  process.env[name] as string;

/**
 * Form a version string from Webiny styled id ([entryId]#[revision])
 * @example
 *   versionFromId('a988j#0001') // 'v1'
 * @param id
 * @returns
 */
export const versionFromId = (id: string) =>
  `v${Number.parseInt(id.substring(id.indexOf('#') + 1))}`;

const nameOrEmail = R.pipe<User, any, any>(
  R.props(['name', 'email']),
  R.find(Boolean)
);

/**
 * Sort users by their name or their email
 */
export const sortUsers = R.sortBy<User>(R.compose(R.toLower, nameOrEmail));

const isNotEmptyOrUuid = (id: string) => id && !/^group-.+/.test(id);

/**
 * Convert user form values to user dtos suitable for the server
 * @param values
 * @returns
 */
export function toUserDto(values: User) {
  return {
    ...values,
    group_ids: (values.group_ids || []).filter(isNotEmptyOrUuid),
  };
}

export const findLargestSortIndex = R.pipe(
  R.map<{ sortIndex: number }, number>(R.prop('sortIndex')),
  R.reduce<number, number>(R.max, 0)
);

/**
 * OnClose handler for MUI dialog that only calls the close function if reason is not a backdrop click
 * @param doClose
 * @returns
 */
export const rejectBackdropClick =
  (doClose: Function): ModalProps['onClose'] =>
  (_e, reason) =>
    reason !== 'backdropClick' && doClose();

/**
 * Add an item to a list. If on or more existing entries are found ([comparator] returns true) then those are removed and
 * subject is added to the end of the list.
 * @param comparator
 * @param subject
 * @param list
 * @returns
 */
export const replaceOrAdd = <T>(
  comparator: (...param: any[]) => boolean,
  subject: T,
  list: T[] = []
): T[] => R.append(subject, R.without(list.filter(comparator), list));
