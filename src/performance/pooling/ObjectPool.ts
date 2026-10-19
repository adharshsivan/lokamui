/**
 * Lokam Mini — ObjectPool
 * Generic high-performance object pool to eliminate garbage collection stutters in tight game loops.
 */

export class ObjectPool<T> {
  private pool: T[] = [];

  constructor(
    private factory: () => T,
    private reset: (item: T) => void,
    initialSize = 16
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(item: T): void {
    this.reset(item);
    this.pool.push(item);
  }

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }
}
