import type { Context, ContextEntry, ContextMetadata } from './types';

export class ContextManager {
  private contexts: Map<string, Context> = new Map();
  private maxContextSize = 1000000; // 1MB

  async createContext(siteId?: string): Promise<Context> {
    const context: Context = {
      id: this.generateId(),
      siteId,
      sessionId: this.generateSessionId(),
      data: {},
      history: [],
      metadata: {
        created: new Date(),
        updated: new Date(),
        totalTokens: 0,
        entryCount: 0,
        size: 0,
      },
    };

    this.contexts.set(context.id, context);
    return context;
  }

  async getContext(contextId: string): Promise<Context | undefined> {
    return this.contexts.get(contextId);
  }

  async updateContext(contextId: string, updates: Partial<Context>): Promise<void> {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    Object.assign(context, updates);
    context.metadata.updated = new Date();
  }

  async addToHistory(contextId: string, entry: ContextEntry): Promise<void> {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    context.history.push(entry);
    context.metadata.entryCount++;
    context.metadata.totalTokens += entry.tokensUsed;
    context.metadata.updated = new Date();

    // Auto-compress if needed
    if (this.getContextSize(context) > this.maxContextSize) {
      await this.compressContext(contextId);
    }
  }

  async compressContext(contextId: string): Promise<Context> {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    // Keep only recent history
    const recentHistory = context.history.slice(-10);
    context.history = recentHistory;
    context.compressed = true;

    return context;
  }

  async shareContext(fromContextId: string, toContextId: string): Promise<void> {
    const fromContext = this.contexts.get(fromContextId);
    const toContext = this.contexts.get(toContextId);

    if (!fromContext || !toContext) {
      throw new Error('Context not found');
    }

    // Share relevant data
    toContext.data = { ...toContext.data, ...fromContext.data };
  }

  private getContextSize(context: Context): number {
    return JSON.stringify(context).length;
  }

  private generateId(): string {
    return `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `ses-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
