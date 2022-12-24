import { ReactNode, useEffect, useLayoutEffect, useState } from 'react';

interface NoSSRProps {
  children: ReactNode;
  defer?: boolean;
  fallback?: ReactNode;
}

const useEnhancedEffect =
  typeof window !== 'undefined' && process.env.NODE_ENV !== 'test'
    ? useLayoutEffect
    : useEffect;

function NoSSR({ children, defer = false, fallback = null }: NoSSRProps) {
  const [isMounted, setMountedState] = useState(false);

  useEnhancedEffect(() => {
    if (!defer) setMountedState(true);
  }, [defer]);

  useEffect(() => {
    if (defer) setMountedState(true);
  }, [defer]);

  return <>{isMounted ? children : fallback}</>;
}

export default NoSSR;
