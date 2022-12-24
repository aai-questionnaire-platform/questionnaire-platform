import {
  DependencyList,
  EffectCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';

export const useEffectAfterMount = (
  effect: EffectCallback,
  deps?: DependencyList
) => {
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
