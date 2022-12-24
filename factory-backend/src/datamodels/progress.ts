import { path, propEq } from 'ramda';
import { ValidationError } from './error/validation-error';

/**
 * Progress by question category
 */
export interface Progress {
  user_id?: string;
  questionnaire_id?: string;
  organization_ids?: string[];
  category_statuses: CategoryStatus[];
}

/**
 * Progress by question category with group statistics: group member count
 */
export interface ProgressWithGroupStatistics extends Progress {
  groupMemberCount: number;
  completionCounts: { [categoryId: string]: number };
}

export interface CategoryStatus {
  category_id: string;
  state: CategoryState;
}

export enum CategoryState {
  LOCKED = 1, //Locked category, not playable just yet
  UNLOCKED = 2, //Unanwered, unlocked category
  COMPLETED = 3, //Completed category (all questions have been answered)
  APPROVED = 4, //Approved category
}

export function generateDefaultProgress(categoryIds: string[]): Progress {
  // set all categories LOCKED except the first one
  const categories = categoryIds.map((id, i) => ({
    category_id: id,
    state: i === 0 ? CategoryState.UNLOCKED : CategoryState.LOCKED,
  }));

  return {
    organization_ids: [],
    user_id: '',
    questionnaire_id: '',
    category_statuses: categories,
  };
}

const getCategory = (category_id: string, progress: Progress) =>
  progress.category_statuses.find(propEq('category_id', category_id));

/**
 * Updates the state to CategoryState.COMPLETED if found
 * @param progress
 * @param category_id
 */
export function updateProgress(
  progress: Progress,
  category_id: string,
  state: CategoryState
) {
  if (progress) {
    // seek the existing category progress object
    let categoryProgress = getCategory(category_id, progress);
    if (categoryProgress) {
      validateTransition(categoryProgress.state, state);
      categoryProgress.state = state;
    } else {
      //Add the category status
      categoryProgress = {
        category_id: category_id,
        state: state,
      };
      progress.category_statuses.push(categoryProgress);
    }
  }
}

/**
 * Define valid transtition for each category state
 */
const validTransitions = {
  [CategoryState.LOCKED]: {
    [CategoryState.UNLOCKED]: true,
    // this is an anomaly! but a category can be locked and unlocked even if there are anwsers so
    // transitions between UNLOCKED and COMPLETED must be permitted
    [CategoryState.COMPLETED]: true,
  },
  [CategoryState.UNLOCKED]: {
    [CategoryState.LOCKED]: true,
    [CategoryState.COMPLETED]: true,
    [CategoryState.APPROVED]: true,
  },
  [CategoryState.COMPLETED]: {
    // @see validTransitions.CategoryState.LOCKED.CategoryState.COMPLETED
    [CategoryState.LOCKED]: true,
    [CategoryState.UNLOCKED]: true,
    [CategoryState.APPROVED]: true,
  },
  [CategoryState.APPROVED]: {
    [CategoryState.UNLOCKED]: true,
    [CategoryState.COMPLETED]: true,
  },
};

/**
 * Validate transition between states
 * @param prev
 * @param next
 */
export function validateTransition(prev: CategoryState, next: CategoryState) {
  if (prev !== next && !path<boolean>([prev, next], validTransitions)) {
    throw new ValidationError(
      `Validation failed: Cannot move from state ${prev} to ${next}`
    );
  }
}
