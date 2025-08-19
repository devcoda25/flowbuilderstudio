import type { Edge, Node } from 'reactflow';

export type Channel =
  | 'whatsapp' | 'sms' | 'email' | 'push' | 'voice'
  | 'slack' | 'teams' | 'telegram' | 'instagram' | 'messenger' | 'webchat';

export type FlowState = { nodes: Node[]; edges: Edge[] };

export type EngineOptions = {
  channel?: Channel;
  clock?: 'real' | 'mock';
};

export type TraceEvent = {
  ts: number;
  nodeId: string;
  result: string;
};

export type BotMessage = {
  id: string;
  text: string;
  channel: Channel;
  attachments?: any[];
  actions?: {
    buttons?: { label: string }[];
  }
};

export type EngineStatus = 'idle' | 'running' | 'waiting' | 'stopped' | 'completed';

export type EngineEventMap = {
  status: EngineStatus;
  botMessage: BotMessage;
  trace: TraceEvent;
  error: { nodeId: string; message: string };
  waitingForInput: { nodeId: string; varName: string };
  done: { reason: 'completed' | 'stopped' };
};
