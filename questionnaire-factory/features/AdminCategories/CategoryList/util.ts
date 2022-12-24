import * as R from 'ramda';

import { CategoryState } from '@/enums';
import { CategoryWithProgress } from '@/types';

export const getCenterOfElement = (node: Element, parent: Element) => {
  const { x, y } = parent.getBoundingClientRect();
  const { top, left, width, height } = node.getBoundingClientRect();
  return { x: left + width / 2 - x, y: top + height / 2 - y };
};

const getPrevLevelIndex = (level: any, levels: any) =>
  R.dec(R.findIndex(R.propEq('id', level.id), levels));

const getPrevLevelState = (level: any, levels: any) =>
  levels[getPrevLevelIndex(level, levels)]?.state;

/**
 * Check if category's status can be set to UNLOCKED.
 * This can be done if the previous level (if any) is unlocked
 * @param level
 * @param levels
 * @returns
 */
export const resolveIfUnlockable = (
  level: CategoryWithProgress,
  levels: CategoryWithProgress[]
) =>
  getPrevLevelState(level, levels) === CategoryState.LOCKED
    ? false
    : level.state === CategoryState.LOCKED;

/**
 * Check if category's status can be set back to LOCKED.
 * This can only be done if it's the last unlocked level
 * @param level
 * @param levels
 * @returns
 */
export const resolveIfLockable = (
  level: CategoryWithProgress,
  levels: CategoryWithProgress[]
) => R.findLast(R.propEq('state', CategoryState.UNLOCKED), levels) === level;
