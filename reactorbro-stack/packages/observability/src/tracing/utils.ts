/**
 * Trace Decorators and Utilities
 * Helper functions for instrumenting code with tracing
 */

import { tracer } from './tracer.js';
import { traceContextManager } from './context.js';

/**
 * Trace a function execution
 */
export function traceFunction<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const context = traceContextManager.getContext();
    if (!context) {
      return fn(...args);
    }

    const spanId = tracer.startSpan(context.traceId, name);

    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((value) => {
            tracer.endSpan(spanId, 'success');
            return value;
          })
          .catch((error) => {
            tracer.endSpan(spanId, 'error', { error: error.message });
            throw error;
          }) as any;
      }

      tracer.endSpan(spanId, 'success');
      return result;
    } catch (error: any) {
      tracer.endSpan(spanId, 'error', { error: error.message });
      throw error;
    }
  }) as T;
}

/**
 * Trace an async function
 */
export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const context = traceContextManager.getContext();
  if (!context) {
    return fn();
  }

  const spanId = tracer.startSpan(context.traceId, name);

  try {
    const result = await fn();
    tracer.endSpan(spanId, 'success');
    return result;
  } catch (error: any) {
    tracer.endSpan(spanId, 'error', { error: error.message });
    throw error;
  }
}

/**
 * Create a trace for a request
 */
export function traceRequest(name: string, attributes?: Record<string, any>) {
  const context = tracer.startTrace(name, attributes);
  traceContextManager.setContext(context);
  return context;
}

/**
 * End a trace for a request
 */
export function endTrace(traceId: string, status: 'success' | 'error' = 'success') {
  tracer.endTrace(traceId, status);
  traceContextManager.clearContext();
}

export default {
  traceFunction,
  traceAsync,
  traceRequest,
  endTrace,
};

