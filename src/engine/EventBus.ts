export class EventBus<T extends Record<string, any>> {
  private map = new Map<keyof T, Set<(p: any) => void>>();

  on<K extends keyof T>(event: K, fn: (payload: T[K]) => void) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(fn as any);
    return () => this.off(event, fn);
  }

  off<K extends keyof T>(event: K, fn: (payload: T[K]) => void) {
    this.map.get(event)?.delete(fn as any);
  }

  emit<K extends keyof T>(event: K, payload: T[K]) {
    this.map.get(event)?.forEach((fn) => (fn as any)(payload));
  }

  clear() {
    this.map.clear();
  }
}
