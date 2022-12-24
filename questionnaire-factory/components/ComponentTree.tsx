import dynamic from 'next/dynamic';
import { createElement, memo } from 'react';

import type { ComponentDefinition } from '@/schema/Components';
import { uniqueId } from '@/util';

const COMPONENTS: Record<string, any> = {
  __TEST_ONLY_TYPOGRAPHY: dynamic(() => import('../components/Typography')),
  FRONT_PAGE: dynamic(() => import('../features/FrontPage')),
  CATEGORY: dynamic(() => import('../features/Category')),
  CATEGORY_END: dynamic(() => import('../features/CategoryEnd')),
  PROGRESS: dynamic(() => import('../features/Progress')),
  ANSWER_SUMMARY: dynamic(() => import('../features/AnswerSummary')),
  FEEDBACK: dynamic(() => import('../features/Feedback')),
  ADMIN_GROUPS: dynamic(() => import('../features/AdminGroups')),
  REGISTRATION: dynamic(() => import('../features/Registration')),
  ADMIN_CATEGORIES: dynamic(() => import('../features/AdminCategories')),
  ADMIN_ANSWER_SUMMARY: dynamic(() => import('../features/AdminAnswerSummary')),
  HN_CATEGORY: dynamic(() => import('../features/HnCategory')),
  HN_RESULTS: dynamic(() => import('../features/HnResults')),
  HN_FRONT_PAGE: dynamic(() => import('../features/HnFrontPage')),
  HN_SIGN_IN_HANDLER: dynamic(
    () => import('../features/HnResults/HnSignInHandler')
  ),
};

function renderComponent(component: ComponentDefinition) {
  if (typeof component === 'string') {
    return component;
  }

  const Component = COMPONENTS[component.type];

  return createElement(
    Component,
    { ...component.props, key: uniqueId(component.type) },
    // if the component has children then recursively render them too
    Array.isArray(component.children)
      ? component.children.map(renderComponent as any)
      : component.children ?? null
  );
}

interface ComponentTreeProps {
  tree?: ComponentDefinition[];
}

/**
 * Component responsible for rendering the ui from the app structure json
 * @param props
 * @returns
 */
const ComponentTree = memo(({ tree = [] }: ComponentTreeProps) => (
  <>{tree.map(renderComponent)}</>
));

ComponentTree.displayName = 'ComponentTree';

export default ComponentTree;
