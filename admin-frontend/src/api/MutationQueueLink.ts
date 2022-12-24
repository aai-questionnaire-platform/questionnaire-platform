import { ApolloLink, Operation, FetchResult, NextLink } from '@apollo/client';
import { Observer, Observable } from 'zen-observable-ts';
import { isProcessingMutationsVar } from './reactiveVars';

interface OperationQueueEntry {
  operation: Operation;
  forward: NextLink;
  observer: Observer<FetchResult>;
  subscription?: { unsubscribe: () => void };
}

/**
 * An Apollo link that enqueues mutations so that they cannot fire in parallel.
 *
 * To skip the queue pass `{ context: { skipQueue: true } }` to your mutation.
 */
export default class MutationQueueLink extends ApolloLink {
  private opQueue: OperationQueueEntry[] = [];
  private inProcess: Boolean = false;

  private processOperation(entry: OperationQueueEntry) {
    const { operation, forward, observer } = entry;
    this.inProcess = true;

    isProcessingMutationsVar(true);

    forward(operation).subscribe({
      next: (result) => {
        this.inProcess = false;
        observer.next && observer.next(result);

        // If there are more operations, process them.
        if (this.opQueue.length) {
          this.processOperation(this.opQueue.shift()!);
        }
      },
      error: (error) => {
        this.inProcess = false;
        observer.error && observer.error(error);

        // If there are more operations, process them.
        if (this.opQueue.length) {
          this.processOperation(this.opQueue.shift()!);
        }
      },
      complete: observer.complete && observer.complete.bind(observer),
    });
  }

  private cancelOperation(entry: OperationQueueEntry) {
    this.opQueue = this.opQueue.filter((e) => e !== entry);

    if (!this.opQueue.length && !this.inProcess) {
      isProcessingMutationsVar(false);
    }
  }

  private enqueue(entry: OperationQueueEntry) {
    this.opQueue.push(entry);
  }

  public request(
    operation: Operation,
    forward: NextLink
  ): Observable<FetchResult> | null {
    // Enqueue all mutations unless manually skipped.
    if (isMutation(operation) && !operation.getContext().skipQueue) {
      return new Observable((observer) => {
        const operationEntry = { operation, forward, observer };

        if (!this.inProcess) {
          this.processOperation(operationEntry);
        } else {
          this.enqueue(operationEntry);
        }

        return () => this.cancelOperation(operationEntry);
      });
    } else {
      return forward(operation);
    }
  }
}

function isMutation(operation: Operation) {
  return operation.query.definitions.some(
    (definition) =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation'
  );
}
