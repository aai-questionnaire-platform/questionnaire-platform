import * as R from 'ramda';
import { replaceOrAdd } from '../util';
import { User } from '../types';
import { usersVar } from './reactiveVars';
import { postJSON } from './rest-connector';

/**
 * Create a new group admin user to Cognito. Also add the value to the local cache.
 * @param userDto
 * @returns
 */
export const createUser = async (userDto: User) => {
  try {
    const { user } = await postJSON('users', {}, userDto);
    usersVar([...usersVar(), user]);
  } catch (e) {
    console.error('createUser(): ', e);
  }
};

/**
 * Edit an existing user. Also update the local cache.
 * @param userDto
 */
export const editUser = async (userDto: User) => {
  try {
    const { user } = await postJSON('users', { userId: userDto.id! }, userDto);
    const updated = replaceOrAdd(R.propEq('id', userDto.id), user, usersVar());
    usersVar(updated);
  } catch (e) {
    console.error('createUser(): ', e);
  }
};
