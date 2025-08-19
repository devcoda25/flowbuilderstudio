import type { Edge, Node } from 'reactflow';

export type RTNode = {
  id: string;
  kind: 'message' | 'ask' | 'condition' | 'delay' | 'api' | 'unknown';
  data: any;
};
export type OutEdge = { to: string; branch?: string; label?: string };

export type Compiled = {
  nodes: Map<string, RTNode>;
  next: Map<string, OutEdge[]>;
  starts: string[];
};

function normKind(n: Node): RTNode['kind'] {
  const t = (n.type || '').toLowerCase();
  const k = (n.data?.kind || n.data?.label || '').toLowerCase();
  const key = t || k;
  
  if (['message', 'sms', 'email', 'push', 'voice', 'chattemplate', 'carousel'].some(term => key.includes(term))) return 'message';
  if (['ask', 'askquestion', 'input'].some(term => key.includes(term))) return 'ask';
  if (['condition', 'logic', 'branch'].some(term => key.includes(term))) return 'condition';
  if (['delay', 'wait', 'timer', 'timing'].some(term => key.includes(term))) return 'delay';
  if (['webhook', 'api', 'apicall', 'apicallout'].some(term => key.includes(term))) return 'api';
  if (['get started'].some(term => key.includes(term))) return 'message'; // Treat start as a message
  
  return 'unknown';
}


export function compile(nodes: Node[], edges: Edge[]): Compiled {
  const nmap = new Map<string, Node>();
  nodes.forEach(n => nmap.set(n.id, n));

  const rtNodes = new Map<string, RTNode>();
  nodes.forEach(n => rtNodes.set(n.id, { id: n.id, kind: normKind(n), data: n.data || {} }));

  const next = new Map<string, OutEdge[]>();
  const incoming = new Map<string, number>();
  edges.forEach((e) => {
    const arr = next.get(e.source) || [];
    arr.push({ to: e.target, branch: (e.data as any)?.branch, label: (e as any).label });
    next.set(e.source, arr);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  const starts: string[] = [];
  // Prefer explicit “getStarted” trigger, else nodes with no incoming edges.
  for (const n of nodes) {
    const isTrigger = (n.type || '').toLowerCase() === 'getstarted' || (n.data?.trigger === true) || n.id === 'start';
    const indeg = incoming.get(n.id) || 0;
    if (isTrigger || indeg === 0) {
        if (!starts.includes(n.id)) starts.push(n.id);
    }
  }

  return { nodes: rtNodes, next, starts };
}
