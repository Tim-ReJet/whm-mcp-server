import type { Dependency, DependencyGraph, Conflict, Asset } from './types.js';
import { DependencyError } from './types.js';

export class DependencyManager {
  private dependencies: Map<string, Dependency[]> = new Map();
  private assets: Map<string, Asset> = new Map();

  setAssetRegistry(assets: Map<string, Asset>): void {
    this.assets = assets;
  }

  async addDependency(assetId: string, dependsOn: string, version: string, type: Dependency['type'] = 'required'): Promise<void> {
    // Check for circular dependencies
    if (await this.wouldCreateCycle(assetId, dependsOn)) {
      throw new DependencyError(
        `Circular dependency detected: ${assetId} -> ${dependsOn}`,
        assetId
      );
    }

    const deps = this.dependencies.get(assetId) || [];

    // Check if dependency already exists
    if (deps.some(d => d.dependsOn === dependsOn)) {
      return; // Already exists
    }

    const dependency: Dependency = {
      id: this.generateId(),
      assetId,
      dependsOn,
      version,
      required: type === 'required',
      type,
    };

    deps.push(dependency);
    this.dependencies.set(assetId, deps);
  }

  async removeDependency(assetId: string, dependsOn: string): Promise<void> {
    const deps = this.dependencies.get(assetId) || [];
    const filtered = deps.filter(d => d.dependsOn !== dependsOn);
    this.dependencies.set(assetId, filtered);
  }

  async getDependencies(assetId: string, recursive: boolean = false): Promise<string[]> {
    const directDeps = (this.dependencies.get(assetId) || []).map(d => d.dependsOn);

    if (!recursive) {
      return directDeps;
    }

    const allDeps = new Set<string>(directDeps);
    for (const dep of directDeps) {
      const nestedDeps = await this.getDependencies(dep, true);
      nestedDeps.forEach(d => allDeps.add(d));
    }

    return Array.from(allDeps);
  }

  async getDependents(assetId: string, recursive: boolean = false): Promise<string[]> {
    const directDependents: string[] = [];

    for (const [id, deps] of this.dependencies.entries()) {
      if (deps.some(d => d.dependsOn === assetId)) {
        directDependents.push(id);
      }
    }

    if (!recursive) {
      return directDependents;
    }

    const allDependents = new Set<string>(directDependents);
    for (const dep of directDependents) {
      const nestedDeps = await this.getDependents(dep, true);
      nestedDeps.forEach(d => allDependents.add(d));
    }

    return Array.from(allDependents);
  }

  async buildGraph(assetId: string): Promise<DependencyGraph> {
    const graph: DependencyGraph = {
      root: assetId,
      nodes: [],
      edges: [],
    };

    const visited = new Set<string>();
    await this.buildGraphRecursive(assetId, 0, graph, visited);

    return graph;
  }

  async detectConflicts(assetIds: string[]): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const dependencySets = new Map<string, Set<string>>();

    // Build dependency sets for each asset
    for (const assetId of assetIds) {
      const deps = await this.getDependencies(assetId, true);
      dependencySets.set(assetId, new Set(deps));
    }

    // Check for version conflicts
    for (let i = 0; i < assetIds.length; i++) {
      for (let j = i + 1; j < assetIds.length; j++) {
        const assetA = assetIds[i];
        const assetB = assetIds[j];

        const depsA = dependencySets.get(assetA)!;
        const depsB = dependencySets.get(assetB)!;

        // Find common dependencies
        const commonDeps = Array.from(depsA).filter(d => depsB.has(d));

        for (const dep of commonDeps) {
          const versionA = await this.getDependencyVersion(assetA, dep);
          const versionB = await this.getDependencyVersion(assetB, dep);

          if (versionA && versionB && versionA !== versionB) {
            conflicts.push({
              assetIds: [assetA, assetB],
              reason: `Version conflict for dependency "${dep}": ${versionA} vs ${versionB}`,
              severity: 'error',
            });
          }
        }
      }
    }

    // Check for circular dependencies
    for (const assetId of assetIds) {
      if (await this.hasCircularDependency(assetId)) {
        conflicts.push({
          assetIds: [assetId],
          reason: `Circular dependency detected for asset "${assetId}"`,
          severity: 'error',
        });
      }
    }

    return conflicts;
  }

  async resolve(assetId: string): Promise<Asset[]> {
    const resolved: Asset[] = [];
    const resolvedIds = new Set<string>();
    const queue: string[] = [assetId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (resolvedIds.has(currentId)) {
        continue;
      }

      const asset = this.assets.get(currentId);
      if (!asset) {
        throw new DependencyError(`Asset not found: ${currentId}`, assetId);
      }

      resolved.push(asset);
      resolvedIds.add(currentId);

      // Add dependencies to queue
      const deps = await this.getDependencies(currentId);
      for (const dep of deps) {
        if (!resolvedIds.has(dep)) {
          queue.push(dep);
        }
      }
    }

    return resolved;
  }

  async getTopologicalOrder(assetIds: string[]): Promise<string[]> {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = async (assetId: string) => {
      if (visited.has(assetId)) {
        return;
      }

      visited.add(assetId);

      const deps = await this.getDependencies(assetId);
      for (const dep of deps) {
        await visit(dep);
      }

      result.push(assetId);
    };

    for (const assetId of assetIds) {
      await visit(assetId);
    }

    return result.reverse();
  }

  private async wouldCreateCycle(from: string, to: string): Promise<boolean> {
    if (from === to) {
      return true;
    }

    // Check if 'to' depends on 'from'
    const toDeps = await this.getDependencies(to, true);
    return toDeps.includes(from);
  }

  private async hasCircularDependency(assetId: string): Promise<boolean> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = async (id: string): Promise<boolean> => {
      if (recursionStack.has(id)) {
        return true;
      }

      if (visited.has(id)) {
        return false;
      }

      visited.add(id);
      recursionStack.add(id);

      const deps = await this.getDependencies(id);
      for (const dep of deps) {
        if (await hasCycle(dep)) {
          return true;
        }
      }

      recursionStack.delete(id);
      return false;
    };

    return await hasCycle(assetId);
  }

  private async getDependencyVersion(assetId: string, dependencyId: string): Promise<string | null> {
    const deps = this.dependencies.get(assetId) || [];
    const dep = deps.find(d => d.dependsOn === dependencyId);
    return dep?.version || null;
  }

  private async buildGraphRecursive(
    assetId: string,
    depth: number,
    graph: DependencyGraph,
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(assetId)) {
      return;
    }

    visited.add(assetId);

    const deps = this.dependencies.get(assetId) || [];

    for (const dep of deps) {
      graph.edges.push({
        from: assetId,
        to: dep.dependsOn,
        type: dep.type,
      });

      if (!graph.nodes.find(n => n.id === dep.dependsOn)) {
        const asset = this.assets.get(dep.dependsOn);
        if (asset) {
          graph.nodes.push({
            id: dep.dependsOn,
            asset,
            depth: depth + 1,
          });
        }

        await this.buildGraphRecursive(dep.dependsOn, depth + 1, graph, visited);
      }
    }
  }

  private generateId(): string {
    return `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
