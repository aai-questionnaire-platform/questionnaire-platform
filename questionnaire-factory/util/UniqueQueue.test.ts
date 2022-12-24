import * as R from 'ramda';

import UniqueQueue from '@/util/UniqueQueue';

it('should add single item', () => {
  const q = new UniqueQueue(R.identity);
  q.add(1);
  expect(q.size()).toBe(1);
});

it('should only add unique items', () => {
  const q = new UniqueQueue(R.identity);
  q.add(1);
  q.add(1);
  expect(q.size()).toBe(1);
});

it('should only add unique items using a key function', () => {
  const q = new UniqueQueue<any, string>(R.prop('id'));
  q.add({ id: '1' });
  q.add({ id: '1' });
  expect(q.size()).toBe(1);
});

it('should prefer the latter when comparing uniqueness', () => {
  const q = new UniqueQueue<any, string>(R.prop('id'));
  q.add({ id: '1', i: 1 });
  q.add({ id: '1', i: 2 });
  expect(q.drop()).toEqual({ id: '1', i: 2 });
});

it('should drop the first item', () => {
  const q = new UniqueQueue(R.identity);
  q.add(1);
  q.add(2);
  expect(q.drop()).toBe(1);
  expect(q.size()).toBe(1);
});

it('should return undefined if the queue is empty', () => {
  const q = new UniqueQueue(R.identity);
  expect(q.drop()).toBe(undefined);
});

it('should clear the queue', () => {
  const q = new UniqueQueue(R.identity);
  [1, 2, 3].forEach(q.add.bind(q));
  expect(q.dropAll()).toEqual([1, 2, 3]);
  expect(q.size()).toBe(0);
});
