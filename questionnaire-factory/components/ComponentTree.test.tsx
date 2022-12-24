import { render } from '@testing-library/react';
import preloadAll from 'jest-next-dynamic';
import 'jest-styled-components';

import ComponentTree from '@/components/ComponentTree';

beforeAll(async () => {
  await preloadAll();
});

it('should render an empty tree', () => {
  expectToMatchSnapshotWithTree([]);
});

it('should render a string', () => {
  expectToMatchSnapshotWithTree(['string child']);
});

it('should render a component without children', () => {
  expectToMatchSnapshotWithTree([
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'default' },
    },
  ]);
});

it('should render a component with string as a child', async () => {
  expectToMatchSnapshotWithTree([
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'default' },
      children: ['child string'],
    },
  ]);
});

it('should render a component with component as a child', async () => {
  expectToMatchSnapshotWithTree([
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'default' },
      children: [
        {
          type: '__TEST_ONLY_TYPOGRAPHY',
          props: { as: 'span', variant: 'default' },
          children: 'grandchild text',
        },
      ],
    },
  ]);
});

it('should render a tree with siblings', () => {
  expectToMatchSnapshotWithTree([
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'default' },
      children: 'sibling 1',
    },
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'small' },
      children: 'sibling 2',
    },
  ]);
});

it('should render a tree with siblings with children', () => {
  expectToMatchSnapshotWithTree([
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'default' },
      children: [
        {
          type: '__TEST_ONLY_TYPOGRAPHY',
          props: { as: 'span', variant: 'default' },
          children: 'grandchild 1',
        },
      ],
    },
    {
      type: '__TEST_ONLY_TYPOGRAPHY',
      props: { variant: 'small' },
      children: [
        {
          type: '__TEST_ONLY_TYPOGRAPHY',
          props: { as: 'span', variant: 'small' },
          children: 'grandchild 2',
        },
      ],
    },
  ]);
});

function expectToMatchSnapshotWithTree(tree: any) {
  const { container } = render(<ComponentTree tree={tree} />);
  expect(container).toMatchSnapshot();
}
