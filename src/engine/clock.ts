export interface IClock {
  set(fn: () => void, ms: number): number;
  clear(id: number): void;
  flush?(ms?: number): void; // mock-only: advance virtual time
}

export class RealClock implements IClock {
  set(fn: () => void, ms: number) { return (setTimeout(fn, ms) as unknown) as number; }
  clear(id: number) { clearTimeout(id as unknown as number); }
}

type Task = { id: number; at: number; fn: () => void };
export class MockClock implements IClock {
  private now = 0;
  private q: Task[] = [];
  private seq = 1;
  set(fn: () => void, ms: number) {
    const id = this.seq++;
    this.q.push({ id, at: this.now + ms, fn });
    this.q.sort((a, b) => a.at - b.at);
    return id;
  }
  clear(id: number) { this.q = this.q.filter(t => t.id !== id); }
  flush(ms?: number) {
    const end = ms == null ? Number.POSITIVE_INFINITY : this.now + ms;
    while (this.q.length && this.q[0].at <= end) {
      const t = this.q.shift()!;
      this.now = t.at;
      t.fn();
    }
    this.now = Math.min(this.now, end);
  }
}
