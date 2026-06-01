import { AsyncLocalStorage } from 'async_hooks';

interface RequestContextStore {
  requestId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export function getRequestId() {
  return requestContext.getStore()?.requestId;
}
