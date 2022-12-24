import * as R from 'ramda';

import NetworkError from '@/components/NetworkError';
import NoSSR from '@/components/NoSSR';
import { CategoryWithProgress } from '@/types';
import { combineCategoryWithProgress } from '@/util';

import MapSkeleton from './MapSkeleton';
import { ProgressContext } from './ProgressContext';
import { useProgressData } from './util';

function withProgressContext(WrappedComponent: any) {
  return function WrappedWithProgressContext(props: any) {
    const { data, error, loading } = useProgressData();

    if (loading) {
      return (
        <NoSSR>
          <MapSkeleton background={props.background} />
        </NoSSR>
      );
    }

    if (error) {
      return <NetworkError error={error} />;
    }

    const { categories } = data.questionnaire;

    const categoriesWithProgress: CategoryWithProgress[] = categories.map(
      combineCategoryWithProgress(data.progress)
    );

    return (
      <ProgressContext.Provider
        value={{
          categories: categoriesWithProgress,
          config: R.omit(['children'], props),
        }}
      >
        {/* NoSSR is used here as we use useWindowDimensions-hook in Category-component and it needs window to be present to work correctly */}
        <NoSSR>
          <WrappedComponent {...props} />
        </NoSSR>
      </ProgressContext.Provider>
    );
  };
}

export default withProgressContext;
