import type { Edge, Node } from 'reactflow';

export type RTNode = {
  id: string;
  kind: 'message' | 'ask' | 'condition' | 'delay' | 'api' | 'unknown' | 'buttons' | 'list';
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
  const label = (n.data?.label || '').toLowerCase();
  const key = `${t} ${label}`;
  
  if (label === 'buttons') return 'buttons';
  if (label === 'list') return 'list';
  if (label === 'send a message') return 'message';
  if (label === 'question') return 'ask';
  if (label.includes('condition')) return 'condition';
  if (label.includes('delay')) return 'delay';
  if (label.includes('webhook')) return 'api';
  if (key.includes('get started') || key.includes('keyword')) return 'message'; // Treat start triggers as a message for execution
  
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
    // For Buttons/List nodes, the branch is the sourceHandle
    const branch = e.sourceHandle || (e.data as any)?.branch;
    arr.push({ to: e.target, branch, label: (e as any).label });
    next.set(e.source, arr);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  const starts: string[] = [];
  // Find nodes with no incoming edges or explicitly marked as triggers
  for (const n of nodes) {
    const isTrigger = (n.data?.type === 'triggers');
    const indeg = incoming.get(n.id) || 0;
    if (isTrigger || indeg === 0) {
        if (!starts.includes(n.id)) starts.push(n.id);
    }
  }

  return { nodes: rtNodes, next, starts };
}
