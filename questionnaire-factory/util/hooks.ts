import {
  DependencyList,
  EffectCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTheme } from 'styled-components';

import { Theme } from '@/schema/Theme';

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

function getWindowDimensions() {
  if (typeof window !== 'undefined') {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}

/**
 * Hook for getting window dimensions
 */
export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

export const useAppTheme = () => useTheme() as Theme;
