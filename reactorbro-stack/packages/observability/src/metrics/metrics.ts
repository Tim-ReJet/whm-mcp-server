/**
 * Metrics Collection System
 * Prometheus-compatible metrics with custom metrics support
 */

export interface MetricLabels {
  [key: string]: string;
}

export interface CounterMetric {
  name: string;
  help: string;
  labels: MetricLabels;
  value: number;
}

export interface GaugeMetric {
  name: string;
  help: string;
  labels: MetricLabels;
  value: number;
}

export interface HistogramMetric {
  name: string;
  help: string;
  labels: MetricLabels;
  buckets: number[];
  observations: number[];
  sum: number;
  count: number;
}

export interface SummaryMetric {
  name: string;
  help: string;
  labels: MetricLabels;
  quantiles: Map<number, number>;
  sum: number;
  count: number;
}

export class Counter {
  private value: number = 0;
  private labels: MetricLabels;

  constructor(
    private name: string,
    private help: string,
    labels: MetricLabels = {}
  ) {
    this.labels = labels;
  }

  inc(value: number = 1): void {
    this.value += value;
  }

  get(): CounterMetric {
    return {
      name: this.name,
      help: this.help,
      labels: this.labels,
      value: this.value,
    };
  }

  reset(): void {
    this.value = 0;
  }
}

export class Gauge {
  private value: number = 0;
  private labels: MetricLabels;

  constructor(
    private name: string,
    private help: string,
    labels: MetricLabels = {}
  ) {
    this.labels = labels;
  }

  set(value: number): void {
    this.value = value;
  }

  inc(value: number = 1): void {
    this.value += value;
  }

  dec(value: number = 1): void {
    this.value -= value;
  }

  get(): GaugeMetric {
    return {
      name: this.name,
      help: this.help,
      labels: this.labels,
      value: this.value,
    };
  }

  reset(): void {
    this.value = 0;
  }
}

export class Histogram {
  private observations: number[] = [];
  private buckets: number[];
  private sum: number = 0;
  private count: number = 0;
  private labels: MetricLabels;

  constructor(
    private name: string,
    private help: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    labels: MetricLabels = {}
  ) {
    this.buckets = buckets;
    this.labels = labels;
  }

  observe(value: number): void {
    this.observations.push(value);
    this.sum += value;
    this.count++;
  }

  get(): HistogramMetric {
    return {
      name: this.name,
      help: this.help,
      labels: this.labels,
      buckets: this.buckets,
      observations: this.observations,
      sum: this.sum,
      count: this.count,
    };
  }

  reset(): void {
    this.observations = [];
    this.sum = 0;
    this.count = 0;
  }
}

export class Summary {
  private observations: number[] = [];
  private quantiles: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;
  private labels: MetricLabels;

  constructor(
    private name: string,
    private help: string,
    private quantileValues: number[] = [0.5, 0.9, 0.95, 0.99],
    labels: MetricLabels = {}
  ) {
    this.labels = labels;
  }

  observe(value: number): void {
    this.observations.push(value);
    this.sum += value;
    this.count++;

    // Calculate quantiles
    const sorted = [...this.observations].sort((a, b) => a - b);
    for (const quantile of this.quantileValues) {
      const index = Math.ceil(sorted.length * quantile) - 1;
      this.quantiles.set(quantile, sorted[index] || 0);
    }
  }

  get(): SummaryMetric {
    return {
      name: this.name,
      help: this.help,
      labels: this.labels,
      quantiles: this.quantiles,
      sum: this.sum,
      count: this.count,
    };
  }

  reset(): void {
    this.observations = [];
    this.quantiles.clear();
    this.sum = 0;
    this.count = 0;
  }
}

export class MetricsRegistry {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();
  private summaries: Map<string, Summary> = new Map();

  createCounter(name: string, help: string, labels: MetricLabels = {}): Counter {
    const counter = new Counter(name, help, labels);
    this.counters.set(name, counter);
    return counter;
  }

  createGauge(name: string, help: string, labels: MetricLabels = {}): Gauge {
    const gauge = new Gauge(name, help, labels);
    this.gauges.set(name, gauge);
    return gauge;
  }

  createHistogram(name: string, help: string, buckets?: number[], labels: MetricLabels = {}): Histogram {
    const histogram = new Histogram(name, help, buckets, labels);
    this.histograms.set(name, histogram);
    return histogram;
  }

  createSummary(name: string, help: string, quantiles?: number[], labels: MetricLabels = {}): Summary {
    const summary = new Summary(name, help, quantiles, labels);
    this.summaries.set(name, summary);
    return summary;
  }

  getCounter(name: string): Counter | undefined {
    return this.counters.get(name);
  }

  getGauge(name: string): Gauge | undefined {
    return this.gauges.get(name);
  }

  getHistogram(name: string): Histogram | undefined {
    return this.histograms.get(name);
  }

  getSummary(name: string): Summary | undefined {
    return this.summaries.get(name);
  }

  getAllMetrics(): {
    counters: CounterMetric[];
    gauges: GaugeMetric[];
    histograms: HistogramMetric[];
    summaries: SummaryMetric[];
  } {
    return {
      counters: Array.from(this.counters.values()).map(c => c.get()),
      gauges: Array.from(this.gauges.values()).map(g => g.get()),
      histograms: Array.from(this.histograms.values()).map(h => h.get()),
      summaries: Array.from(this.summaries.values()).map(s => s.get()),
    };
  }

  exportPrometheus(): string {
    const lines: string[] = [];

    // Export counters
    for (const counter of this.counters.values()) {
      const metric = counter.get();
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} counter`);
      const labelStr = Object.entries(metric.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      lines.push(`${metric.name}{${labelStr}} ${metric.value}`);
    }

    // Export gauges
    for (const gauge of this.gauges.values()) {
      const metric = gauge.get();
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} gauge`);
      const labelStr = Object.entries(metric.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      lines.push(`${metric.name}{${labelStr}} ${metric.value}`);
    }

    // Export histograms
    for (const histogram of this.histograms.values()) {
      const metric = histogram.get();
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} histogram`);
      // Simplified histogram export
      const labelStr = Object.entries(metric.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      lines.push(`${metric.name}_sum{${labelStr}} ${metric.sum}`);
      lines.push(`${metric.name}_count{${labelStr}} ${metric.count}`);
    }

    return lines.join('\n');
  }

  reset(): void {
    for (const counter of this.counters.values()) {
      counter.reset();
    }
    for (const gauge of this.gauges.values()) {
      gauge.reset();
    }
    for (const histogram of this.histograms.values()) {
      histogram.reset();
    }
    for (const summary of this.summaries.values()) {
      summary.reset();
    }
  }
}

/**
 * Default metrics registry
 */
export const metricsRegistry = new MetricsRegistry();

// Pre-register common metrics
export const buildMetrics = {
  duration: metricsRegistry.createHistogram(
    'build_duration_seconds',
    'Build duration in seconds',
    [1, 5, 10, 30, 60, 120, 300]
  ),
  success: metricsRegistry.createCounter('build_success_total', 'Total successful builds'),
  failure: metricsRegistry.createCounter('build_failure_total', 'Total failed builds'),
  size: metricsRegistry.createGauge('build_size_bytes', 'Build output size in bytes'),
};

export const agentMetrics = {
  tokenUsage: metricsRegistry.createCounter('agent_tokens_total', 'Total tokens used by agents'),
  workflowDuration: metricsRegistry.createHistogram(
    'agent_workflow_duration_seconds',
    'Workflow execution duration',
    [1, 5, 10, 30, 60, 300]
  ),
  workflowSuccess: metricsRegistry.createCounter('agent_workflow_success_total', 'Successful workflows'),
  workflowFailure: metricsRegistry.createCounter('agent_workflow_failure_total', 'Failed workflows'),
};

export const siteMetrics = {
  requests: metricsRegistry.createCounter('site_requests_total', 'Total site requests'),
  errors: metricsRegistry.createCounter('site_errors_total', 'Total site errors'),
  responseTime: metricsRegistry.createHistogram(
    'site_response_time_seconds',
    'Site response time',
    [0.1, 0.5, 1, 2, 5]
  ),
};

export default metricsRegistry;

