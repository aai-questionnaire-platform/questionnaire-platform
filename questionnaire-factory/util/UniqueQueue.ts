import * as R from 'ramda';

class UniqueQueue<T, K = string> {
  private queue: T[];

  constructor(private keyFn: (e: T) => K) {
    this.queue = [];
  }

  add(entity: T) {
    this.queue.unshift(entity);
    this.queue = R.uniqBy(this.keyFn, this.queue);
  }

  drop() {
    return this.queue.pop();
  }

  dropAll() {
    const q = this.queue;
    this.queue = [];
    return [...q].reverse();
  }

  size() {
    return this.queue.length;
  }
}

export default UniqueQueue;
