import { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import { Position } from 'reactflow';
import type { LayoutMode, LayoutRequest, LayoutResponse } from '@/layoutWorker/protocol';

export type UseLayoutWorkerOptions = {
  gridSize?: number;
  respectLocked?: boolean;
  /** When true, we also set node handle orientation based on layout mode. */
  directionAwareHandles?: boolean;
  /** Provide a function to read measured RF nodes (width/height) – typically rfRef.current.getNodes */
  measureNodes?: () => Node[];
};

export type RunLayoutOptions = {
  /** Scope: whole graph (default) or only selected nodes (subgraph). */
  scope?: 'graph' | 'selection';
  /** Override selected IDs if you manage selection outside React Flow state. */
  selectionIds?: string[];
  /** Override global respectLocked for this run. */
  respectLocked?: boolean;
  /** Override global direction-aware-handles for this run. */
  directionAwareHandles?: boolean;
};

type Pos = { x: number; y: number };
type SnapshotEntry = { pos: Pos; source?: Position; target?: Position; dataPreferred?: { source: Position; target: Position } };

export function useLayoutWorker(
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  opts: UseLayoutWorkerOptions = {}
) {
  const {
    gridSize = 20,
    respectLocked = true,
    directionAwareHandles = true,
    measureNodes,
  } = opts;

  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const pendingId = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastStats, setLastStats] = useState<{ algo: string; durationMs: number } | null>(null);

  // snapshot for "Undo last layout"
  const lastSnapshotRef = useRef<Record<string, SnapshotEntry> | null>(null);

  // Create worker
  useEffect(() => {
    const w = new Worker(new URL('@/layoutWorker/layoutWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = w;

    w.onmessage = (ev: MessageEvent<LayoutResponse>) => {
      const msg = ev.data;
      if (pendingId.current !== msg.runId) return;

      if (msg.type === 'layout:done') {
        const movedIds = new Set(Object.keys(msg.positions));
        const handleMode = (msg.stats.algo.startsWith('dagre:LR') ? 'LR' : 'TB') as 'LR' | 'TB';

        setNodes((nds) =>
          nds.map((n) => {
            let next = n;
            if (movedIds.has(n.id)) {
              next = { ...next, position: msg.positions[n.id] };
              // direction-aware handle orientation
              if (directionAwareHandles) {
                const src = handleMode === 'LR' ? Position.Right : Position.Bottom;
                const tgt = handleMode === 'LR' ? Position.Left : Position.Top;
                next = {
                  ...next,
                  sourcePosition: src,
                  targetPosition: tgt,
                  data: {
                    ...next.data,
                    preferredHandles: { source: src, target: tgt }, // for custom node renderers
                  },
                };
              }
            }
            return next;
          })
        );

        setBusy(false);
        setLastStats({ algo: msg.stats.algo, durationMs: msg.stats.durationMs });
        pendingId.current = null;
      } else if (msg.type === 'layout:error') {
        console.warn('[layout-worker]', msg.message);
        setBusy(false);
        pendingId.current = null;
      }
    };

    return () => {
      w.terminate();
      workerRef.current = null;
    };
  }, [setNodes, directionAwareHandles]);

  /** Build payload, optionally restricted to selection, using **measured** node sizes if available. */
  const buildPayload = useCallback(
    (mode: LayoutMode, runOpts: RunLayoutOptions) => {
      const measure = measureNodes?.() ?? nodes;
      const selectionIds = new Set(
        runOpts.selectionIds && runOpts.selectionIds.length
          ? runOpts.selectionIds
          : measure.filter((n) => n.selected).map((n) => n.id)
      );

      const scope = runOpts.scope ?? 'graph';
      const nodeList = scope === 'selection' ? measure.filter((n) => selectionIds.has(n.id)) : measure;

      // Edges only between included nodes
      const idSet = new Set(nodeList.map((n) => n.id));
      const edgeList = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

      // Snapshot previous positions for undo (only affected nodes)
      const snap: Record<string, SnapshotEntry> = {};
      for (const n of nodeList) {
        snap[n.id] = {
          pos: n.position as Pos,
          source: (n as any).sourcePosition,
          target: (n as any).targetPosition,
          dataPreferred: (n.data as any)?.preferredHandles,
        };
      }
      lastSnapshotRef.current = snap;

      // Build node payload with real sizes
      const nodePayload = nodeList.map((n) => ({
        id: n.id,
        width: (n as any).width ?? 180,
        height: (n as any).height ?? 60,
        position: n.position,
        locked: (n as any).locked === true,
      }));
      const edgePayload = edgeList.map((e) => ({ id: e.id, source: e.source, target: e.target }));

      const msg: LayoutRequest = {
        type: 'layout',
        runId: ++runIdRef.current,
        mode,
        gridSize,
        nodes: nodePayload,
        edges: edgePayload,
        respectLocked: runOpts.respectLocked ?? respectLocked,
      };

      return msg;
    },
    [nodes, edges, gridSize, respectLocked, measureNodes]
  );

  /** Trigger layout. Use scope='selection' for subgraph layout. */
  const runLayout = useCallback(
    (mode: LayoutMode, runOpts: RunLayoutOptions = {}) => {
      if (!workerRef.current) return;
      const msg = buildPayload(mode, runOpts);
      pendingId.current = msg.runId;
      setBusy(true);
      workerRef.current.postMessage(msg);
    },
    [buildPayload]
  );

  /** Undo last layout (restores positions + handle orientation). */
  const undoLastLayout = useCallback(() => {
    const snap = lastSnapshotRef.current;
    if (!snap) return false;
    setNodes((nds) =>
      nds.map((n) => {
        const s = snap[n.id];
        if (!s) return n;
        return {
          ...n,
          position: s.pos,
          sourcePosition: s.source,
          targetPosition: s.target,
          data: {
            ...n.data,
            preferredHandles: s.dataPreferred,
          },
        };
      })
    );
    lastSnapshotRef.current = null;
    return true;
  }, [setNodes]);

  return { runLayout, undoLastLayout, busy, lastStats };
}
