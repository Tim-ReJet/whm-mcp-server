/**
 * Distributed Tracing with OpenTelemetry
 * Provides distributed tracing capabilities for request tracking across services
 */

import { logger } from './logging/logger.js';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
}

export interface Span {
  id: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error' | 'pending';
  attributes: Record<string, any>;
  events: SpanEvent[];
  children: Span[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, any>;
}

export interface Trace {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  spans: Span[];
  status: 'success' | 'error' | 'pending';
  attributes: Record<string, any>;
}

/**
 * Tracer for distributed tracing
 */
export class Tracer {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, Span> = new Map();
  private maxTraces: number = 1000;

  /**
   * Start a new trace
   */
  startTrace(name: string, attributes?: Record<string, any>): TraceContext {
    const traceId = this.generateId();
    const spanId = this.generateId();

    const trace: Trace = {
      id: traceId,
      name,
      startTime: Date.now(),
      spans: [],
      status: 'pending',
      attributes: attributes || {},
    };

    this.traces.set(traceId, trace);

    logger.info('Trace started', { traceId, name });

    return {
      traceId,
      spanId,
      baggage: attributes,
    };
  }

  /**
   * Start a new span
   */
  startSpan(
    traceId: string,
    name: string,
    parentSpanId?: string,
    attributes?: Record<string, any>
  ): string {
    const trace = this.traces.get(traceId);
    if (!trace) {
      throw new Error(`Trace not found: ${traceId}`);
    }

    const spanId = this.generateId();
    const span: Span = {
      id: spanId,
      traceId,
      name,
      startTime: Date.now(),
      status: 'pending',
      attributes: attributes || {},
      events: [],
      children: [],
    };

    if (parentSpanId) {
      const parentSpan = this.findSpan(trace, parentSpanId);
      if (parentSpan) {
        parentSpan.children.push(span);
      } else {
        trace.spans.push(span);
      }
    } else {
      trace.spans.push(span);
    }

    this.activeSpans.set(spanId, span);

    logger.debug('Span started', { traceId, spanId, name });

    return spanId;
  }

  /**
   * End a span
   */
  endSpan(spanId: string, status: 'success' | 'error' = 'success', attributes?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      logger.warn('Span not found', { spanId });
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    if (attributes) {
      Object.assign(span.attributes, attributes);
    }

    this.activeSpans.delete(spanId);

    logger.debug('Span ended', {
      traceId: span.traceId,
      spanId,
      duration: span.duration,
      status,
    });
  }

  /**
   * Add event to span
   */
  addEvent(spanId: string, name: string, attributes?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      logger.warn('Span not found', { spanId });
      return;
    }

    span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  /**
   * End a trace
   */
  endTrace(traceId: string, status: 'success' | 'error' = 'success'): Trace | null {
    const trace = this.traces.get(traceId);
    if (!trace) {
      logger.warn('Trace not found', { traceId });
      return null;
    }

    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.status = status;

    // Check if all spans are completed
    const allSpansCompleted = this.allSpansCompleted(trace);
    if (!allSpansCompleted) {
      logger.warn('Trace ended with incomplete spans', { traceId });
    }

    logger.info('Trace ended', {
      traceId,
      duration: trace.duration,
      status,
      spans: trace.spans.length,
    });

    // Limit trace storage
    if (this.traces.size > this.maxTraces) {
      const oldestTrace = Array.from(this.traces.values())
        .sort((a, b) => a.startTime - b.startTime)[0];
      this.traces.delete(oldestTrace.id);
    }

    return trace;
  }

  /**
   * Get trace by ID
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces
   */
  getAllTraces(limit?: number): Trace[] {
    const traces = Array.from(this.traces.values())
      .sort((a, b) => b.startTime - a.startTime);

    return limit ? traces.slice(0, limit) : traces;
  }

  /**
   * Search traces
   */
  searchTraces(query: {
    name?: string;
    status?: 'success' | 'error' | 'pending';
    minDuration?: number;
    maxDuration?: number;
    startTime?: number;
    endTime?: number;
  }): Trace[] {
    return Array.from(this.traces.values()).filter((trace) => {
      if (query.name && !trace.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }

      if (query.status && trace.status !== query.status) {
        return false;
      }

      if (query.minDuration && trace.duration && trace.duration < query.minDuration) {
        return false;
      }

      if (query.maxDuration && trace.duration && trace.duration > query.maxDuration) {
        return false;
      }

      if (query.startTime && trace.startTime < query.startTime) {
        return false;
      }

      if (query.endTime && trace.endTime && trace.endTime > query.endTime) {
        return false;
      }

      return true;
    });
  }

  /**
   * Find span in trace
   */
  private findSpan(trace: Trace, spanId: string): Span | null {
    for (const span of trace.spans) {
      if (span.id === spanId) {
        return span;
      }

      const found = this.findSpanInChildren(span, spanId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Find span in children recursively
   */
  private findSpanInChildren(span: Span, spanId: string): Span | null {
    for (const child of span.children) {
      if (child.id === spanId) {
        return child;
      }

      const found = this.findSpanInChildren(child, spanId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Check if all spans are completed
   */
  private allSpansCompleted(trace: Trace): boolean {
    for (const span of trace.spans) {
      if (!span.endTime) {
        return false;
      }

      if (!this.allSpansCompletedInChildren(span)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if all child spans are completed
   */
  private allSpansCompletedInChildren(span: Span): boolean {
    for (const child of span.children) {
      if (!child.endTime) {
        return false;
      }

      if (!this.allSpansCompletedInChildren(child)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export trace in OpenTelemetry format
   */
  exportTrace(traceId: string): any {
    const trace = this.getTrace(traceId);
    if (!trace) {
      return null;
    }

    return {
      resourceSpans: [
        {
          resource: {
            attributes: trace.attributes,
          },
          instrumentationLibrarySpans: [
            {
              spans: this.exportSpans(trace.spans),
            },
          ],
        },
      ],
    };
  }

  /**
   * Export spans in OpenTelemetry format
   */
  private exportSpans(spans: Span[]): any[] {
    return spans.map((span) => ({
      traceId: span.traceId,
      spanId: span.id,
      name: span.name,
      startTimeUnixNano: span.startTime * 1000000,
      endTimeUnixNano: span.endTime ? span.endTime * 1000000 : undefined,
      attributes: Object.entries(span.attributes).map(([key, value]) => ({
        key,
        value: { stringValue: String(value) },
      })),
      events: span.events.map((event) => ({
        timeUnixNano: event.timestamp * 1000000,
        name: event.name,
        attributes: event.attributes
          ? Object.entries(event.attributes).map(([key, value]) => ({
              key,
              value: { stringValue: String(value) },
            }))
          : [],
      })),
      status: {
        code: span.status === 'success' ? 'OK' : 'ERROR',
      },
    }));
  }
}

// Global tracer instance
export const tracer = new Tracer();

export default Tracer;

