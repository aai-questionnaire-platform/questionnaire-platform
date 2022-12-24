import { makeVar } from '@apollo/client';
import { LoadingState, User } from '../types';

export const usersVar = makeVar<User[]>([]);
export const publishStateVar = makeVar<LoadingState>('idle');
export const discardStateVar = makeVar<LoadingState>('idle');
export const isProcessingMutationsVar = makeVar<boolean>(false);
