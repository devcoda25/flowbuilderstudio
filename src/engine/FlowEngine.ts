import { EventBus } from './EventBus';
import { RealClock, MockClock, IClock } from './clock';
import { evalExpression, parseDelay, renderTemplate } from './evaluator';
import { compile, Compiled, RTNode } from './FlowCompiler';
import type { EngineEventMap, EngineOptions, FlowState, Channel, EngineStatus } from './types';
import { sendTestRequest } from '@/api/mockServer';
import { useFlowStore } from '@/store/flow';

export class FlowEngine {
  private bus = new EventBus<EngineEventMap>();
  private opts: Required<EngineOptions> = { channel: 'whatsapp', clock: 'real' };
  private clock: IClock = new RealClock();
  private compiled: Compiled | null = null;
  private status: EngineStatus = 'idle';
  private queue: string[] = [];
  private timers = new Set<number>();
  private waiting: { nodeId: string; varName: string } | null = null;
  private vars: Record<string, any> = {};

  constructor(opts?: EngineOptions) {
    if (opts) this.configure(opts);
  }

  configure(opts: EngineOptions) {
    this.opts = { ...this.opts, ...opts };
    this.clock = this.opts.clock === 'mock' ? new MockClock() : new RealClock();
  }

  setFlow(nodes: any[], edges: any[]) {
    this.compiled = compile(nodes, edges);
  }

  reset() {
    this.queue = [];
    this.waiting = null;
    this.vars = {};
    this.timers.forEach((t) => this.clock.clear(t));
    this.timers.clear();
    this.setStatus('idle');
  }

  start(nodeId?: string) {
    if (!this.compiled) throw new Error('FlowEngine: setFlow() first');
    this.reset();
    const startNodeIdFromStore = useFlowStore.getState().startNodeId;
    const start = nodeId || startNodeIdFromStore || this.compiled.starts[0];
    if (!start) return;
    this.queue.push(start);
    this.setStatus('running');
    this.drain();
  }

  startFrom(nodeId: string) { this.start(nodeId); }

  stop() {
    this.setStatus('stopped');
    this.timers.forEach((t) => this.clock.clear(t));
    this.timers.clear();
    this.queue = [];
    this.waiting = null;
    this.bus.emit('done', { reason: 'stopped' });
  }

  pushUserInput(text: string) {
    this.vars.last_user_message = text;
    if (this.waiting) {
      const { nodeId, varName } = this.waiting;
      this.vars[varName] = text;
      this.waiting = null;
      this.setStatus('running');
      const next = this.next(nodeId);
      if (next) { this.queue.push(next); }
      this.drain();
    }
  }

  on<K extends keyof EngineEventMap>(ev: K, fn: (p: EngineEventMap[K]) => void) { return this.bus.on(ev, fn); }
  off<K extends keyof EngineEventMap>(ev: K, fn: (p: EngineEventMap[K]) => void) { return this.bus.off(ev, fn); }

  getVariables() { return { ...this.vars }; }

  advanceMock(ms?: number) { (this.clock as any).flush?.(ms); }

  private setStatus(s: EngineStatus) {
    this.status = s;
    this.bus.emit('status', s);
  }

  private next(fromId: string): string | null {
    const n = this.compiled!.next.get(fromId) || [];
    if (n.length === 0) return null;
    return n[0].to;
  }

  private chooseBranch(fromId: string, truthy: boolean): string | null {
    const outs = this.compiled!.next.get(fromId) || [];
    const want = truthy ? ['true','yes','1'] : ['false','no','0','else','default'];
    const e = outs.find(o => (o.branch && want.includes(String(o.branch).toLowerCase())) ||
                             (o.label && want.includes(String(o.label).toLowerCase())))
           || outs[truthy ? 0 : 1];
    return e ? e.to : null;
  }

  private drain() {
    while (this.queue.length && this.status === 'running') {
      const nodeId = this.queue.shift()!;
      const node = this.compiled!.nodes.get(nodeId);
      if (!node) continue;
      try {
        const proceed = this.execute(node);
        if (proceed === 'async' || proceed === 'wait') break;
      } catch (e: any) {
        this.bus.emit('error', { nodeId, message: e?.message || String(e) });
      }
    }
    if (this.status === 'running' && this.queue.length === 0) {
      this.setStatus('completed');
      this.bus.emit('done', { reason: 'completed' });
    }
  }

  private execute(n: RTNode): 'sync' | 'async' | 'wait' {
    switch (n.kind) {
      case 'message': {
        const text = this.pickMessage(n);
        const rendered = renderTemplate(text, this.vars);
        this.emitBot(rendered, n.data.quickReplies);
        this.trace(n.id, `message("${trunc(text)}")`);
        const nx = this.next(n.id);
        if (nx) this.queue.push(nx);
        return 'sync';
      }
      case 'ask': {
        const varName = n.data?.varName || 'answer';
        const prompt = n.data?.prompt ? renderTemplate(String(n.data.prompt), this.vars) : null;
        if (prompt) this.emitBot(prompt);
        this.waiting = { nodeId: n.id, varName };
        this.setStatus('waiting');
        this.bus.emit('waitingForInput', { nodeId: n.id, varName });
        this.trace(n.id, `ask("${varName}")`);
        return 'wait';
      }
      case 'condition': {
        const expr = String(n.data?.expression || '');
        const res = evalExpression(expr, { ...this.vars });
        const tgt = this.chooseBranch(n.id, !!res);
        this.trace(n.id, `condition(${res ? 'true' : 'false'})`);
        if (tgt) this.queue.push(tgt);
        return 'sync';
      }
      case 'delay': {
        const ms = parseDelay(n.data?.delay || n.data?.waitMs);
        const id = this.clock.set(() => {
          this.trace(n.id, `delay ${ms}ms`);
          const nx = this.next(n.id);
          if (nx) this.queue.push(nx);
          this.timers.delete(id);
          if (this.status === 'running') this.drain();
        }, ms);
        this.timers.add(id);
        return 'async';
      }
      case 'api': {
        const req = this.buildApiRequest(n);
        sendTestRequest(req as any).then((res) => {
          this.vars.last_api_response = res;
          if (n.data?.assignTo) this.vars[n.data.assignTo] = res;
          this.trace(n.id, `api ${req.method} ${req.url} → ${res.statusCode}`);
          const nx = this.next(n.id);
          if (nx) this.queue.push(nx);
          if (this.status === 'running') this.drain();
        }).catch((err) => {
          this.trace(n.id, `api error: ${err?.message || err}`);
        });
        return 'async';
      }
      default: {
        this.trace(n.id, 'noop');
        const nx = this.next(n.id);
        if (nx) this.queue.push(nx);
        return 'sync';
      }
    }
  }

  private pickMessage(n: RTNode): string {
    const d = n.data || {};
    if (typeof d.text === 'string') return d.text;
    return d.label || '...';
  }

  private buildApiRequest(n: RTNode) {
    const d = n.data?.api || n.data || {};
    const url = renderTemplate(String(d.url || ''), this.vars);
    const method = String(d.method || 'POST').toUpperCase();
    const headers = Array.isArray(d.headers) ? d.headers.map((h: any) => ({
      key: h.key, value: renderTemplate(String(h.value), this.vars)
    })) : [];
    let body = d.body;
    if (typeof body === 'string') body = renderTemplate(body, this.vars);
    return { url, method, headers, body };
  }

  private emitBot(text: string, buttons?: { label: string }[]) {
    this.bus.emit('botMessage', {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
      text,
      channel: this.opts.channel as Channel,
      actions: { buttons }
    });
  }

  private trace(nodeId: string, result: string) {
    this.bus.emit('trace', { ts: Date.now(), nodeId, result });
  }
}

function trunc(s: string, n = 40) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
