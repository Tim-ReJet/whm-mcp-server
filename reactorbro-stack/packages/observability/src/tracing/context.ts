/**
 * Trace Context Manager
 * Manages trace context propagation across services
 */

import { TraceContext } from './tracer.js';

export class TraceContextManager {
  private context: TraceContext | null = null;

  /**
   * Set current trace context
   */
  setContext(context: TraceContext): void {
    this.context = context;
  }

  /**
   * Get current trace context
   */
  getContext(): TraceContext | null {
    return this.context;
  }

  /**
   * Clear trace context
   */
  clearContext(): void {
    this.context = null;
  }

  /**
   * Inject trace context into headers
   */
  injectHeaders(): Record<string, string> {
    if (!this.context) {
      return {};
    }

    return {
      'x-trace-id': this.context.traceId,
      'x-span-id': this.context.spanId,
      'x-parent-span-id': this.context.parentSpanId || '',
      'x-trace-baggage': JSON.stringify(this.context.baggage || {}),
    };
  }

  /**
   * Extract trace context from headers
   */
  extractFromHeaders(headers: Record<string, string>): TraceContext | null {
    const traceId = headers['x-trace-id'] || headers['traceparent'];
    const spanId = headers['x-span-id'];
    const parentSpanId = headers['x-parent-span-id'];
    const baggage = headers['x-trace-baggage'];

    if (!traceId) {
      return null;
    }

    return {
      traceId,
      spanId: spanId || traceId,
      parentSpanId: parentSpanId || undefined,
      baggage: baggage ? JSON.parse(baggage) : undefined,
    };
  }

  /**
   * Create child context
   */
  createChildContext(): TraceContext | null {
    if (!this.context) {
      return null;
    }

    return {
      traceId: this.context.traceId,
      spanId: this.generateId(),
      parentSpanId: this.context.spanId,
      baggage: this.context.baggage,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global context manager
export const traceContextManager = new TraceContextManager();

export default TraceContextManager;

