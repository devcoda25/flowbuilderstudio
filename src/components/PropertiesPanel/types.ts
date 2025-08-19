import type { Node } from 'reactflow'
import type { Channel, NodeCategory } from '@/components/SidebarPalette'

export type TabKey =
  | 'general'
  | 'message'
  | 'api'
  | 'logic'
  | 'schedule'
  | 'campaign'
  | 'ai'
  | 'handoff'
  | 'analytics'
  | 'subflow'
  | 'googleSheets';

export const TAB_KEYS: TabKey[] = [
  'general','message','api','logic','schedule','campaign','ai','handoff','analytics','subflow', 'googleSheets'
];

export type MessageContext = 'template' | 'in-session'

export type PropertiesPanelProps = {
  /** Selected node (null hides panel). */
  node: Node | null
  /** Called on any form change (debounced). Merge into your node data. */
  onSave: (nodeId: string, values: Record<string, any>) => void
  onClose: () => void
  /** WhatsApp message context affects validation; defaults to 'template'. */
  waContext?: MessageContext
  /** Active channels (for conditional UI in Message tab). */
  channels?: Channel[]
  /** Optionally force-open/close; if omitted, panel opens when node != null. */
  open?: boolean
}
