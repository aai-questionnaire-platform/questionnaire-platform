import { useRouter } from 'next/router';
import * as R from 'ramda';

import NetworkError from '@/components/NetworkError';
import { CategoryComponent } from '@/schema/Components';
import { Category } from '@/types';
import { asColorDef, getQueryParam } from '@/util';
import { categoryLens } from '@/util/lenses';

import { CategoryContext } from './CategoryContext';
import CategoryLayout from './CategoryLayout';
import CategorySkeleton from './CategorySkeleton';
import { useCategoryData } from './util';

function withCategoryContext(WrappedComponent: any) {
  return function WrappedWithAppContext(props: CategoryComponent['props']) {
    const { data, error, loading } = useCategoryData();
    const router = useRouter();
    const categoryId = getQueryParam('id', router);
    const background = props.background;

    const category: Category | undefined = data.questionnaire
      ? R.view(categoryLens(categoryId), data.questionnaire)
      : undefined;

    const backgroundColor = category?.backgroundColor
      ? { ...(background ?? {}), ...asColorDef(category.backgroundColor) }
      : background;

    if (loading) {
      return (
        <CategoryLayout background={backgroundColor}>
          <CategorySkeleton />
        </CategoryLayout>
      );
    }

    if (error) {
      return <NetworkError error={error} />;
    }

    if (!category) {
      router.replace('/404');
      return null;
    }

    return (
      <CategoryLayout background={backgroundColor}>
        <CategoryContext.Provider
          value={{
            ...data,
            category,
            config: R.omit(['children'], props),
          }}
        >
          <WrappedComponent {...props} />
        </CategoryContext.Provider>
      </CategoryLayout>
    );
  };
}

export default withCategoryContext;
