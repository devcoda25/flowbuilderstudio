import type { FlowEngine } from "@/engine/FlowEngine";

export type Channel =
  | 'whatsapp' | 'sms' | 'email' | 'push' | 'voice'
  | 'slack' | 'teams' | 'telegram';

export type QuickReply = { id: string; label: string };
export type UrlCTA = { id: string; label: string; url: string };
export type PhoneCTA = { id: string; label: string; phone: string };
export type PromoCTA = { id: string; label: string; code: string };

export type Attachment = { id: string; type: 'image' | 'video' | 'audio' | 'file'; name?: string; url: string };

export type ChatMessage = {
  id: string;
  from: 'user' | 'bot' | 'system';
  text?: string;
  actions?: {
    buttons?: QuickReply[];
    urlCtas?: UrlCTA[];
    phoneCtas?: PhoneCTA[];
    promoCtas?: PromoCTA[];
  };
  attachments?: Attachment[];
  meta?: Record<string, unknown>;
};

export type TraceEvent = {
  ts: number;
  type: string;                 // e.g. enterNode | exitNode | api | error | log
  nodeId?: string;
  nodeLabel?: string;
  result?: string;
  data?: unknown;
};

export type EngineStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'error' | 'completed' | 'waiting';


export type TestConsoleProps = {
  isOpen: boolean;
  onClose: () => void;
  engine: FlowEngine;
  initialChannel?: Channel;
  initialContext?: Record<string, unknown>;
  flowId?: string;
  className?: string;
};
