// Canonical list of sections & items.
// - `type` equals section key for easy analytics.
// - Optional `channels` can restrict visibility by channel (if you pass filterChannels).
import type { LucideIcon } from 'lucide-react';
import { NODE_COLORS } from '@/lib/color-utils';
import { nanoid } from 'nanoid';

export type NodeCategory =
  | 'triggers'
  | 'messaging'
  | 'inputs'
  | 'logic'
  | 'integrations'
  | 'handoff'
  | 'end';

export type Channel =
  | 'whatsapp' | 'sms' | 'email' | 'push' | 'voice' | 'instagram'
  | 'messenger' | 'webchat' | 'slack' | 'teams' | 'telegram'

export type PaletteItemPayload = {
  key: string
  label: string
  icon: string | LucideIcon
  type: NodeCategory
  color?: string
  description?: string
  content?: string
  quickReplies?: { id: string; label: string }[];
}

export type ItemDefinition = PaletteItemPayload & {
  channels?: Channel[]
  keywords?: string[] // improves search discoverability
}

export type SectionDefinition = {
  key: NodeCategory
  title: string
  items: ItemDefinition[]
}

export const SECTION_DATA: SectionDefinition[] = [
    {
      key: 'triggers',
      title: 'Triggers',
      items: [
          { key: 'keyword', label: 'Keyword',  icon: 'AtSign', type: 'triggers',   color: NODE_COLORS[0], description: 'Triggered by a specific keyword' },
          { key: 'default_action', label: 'Default Action',  icon: 'PlayCircle', type: 'triggers',   color: NODE_COLORS[0], description: 'Default flow for new conversations' },
      ]
    },
    {
      key: 'messaging',
      title: 'Messaging',
      items: [
          { key: 'message', label: 'Send a Message', icon: 'Send', type: 'messaging', color: NODE_COLORS[1], description: 'Send text, media, or interactive messages' },
          { key: 'askQuestion', label: 'Ask a Question', icon: 'HelpCircle', type: 'inputs', color: NODE_COLORS[2], description: 'Ask an open-ended question and wait for a reply' },
          { key: 'buttons', label: 'Buttons', icon: 'MessageSquarePlus', type: 'inputs', color: NODE_COLORS[2], description: 'Ask a question with up to 10 buttons', content: 'Ask a question', quickReplies: [{ id: nanoid(), label: 'Button 1' }] },
          { key: 'list', label: 'List', icon: 'List', type: 'inputs', color: NODE_COLORS[2], description: 'Ask a question with a list of up to 10 choices', content: 'Ask a question', quickReplies: [{ id: nanoid(), label: 'Option 1' }] },
          { key: 'sendTemplate', label: 'Send a Template', icon: 'Mailbox', type: 'messaging', color: NODE_COLORS[1], description: 'Send a pre-approved template message', channels: ['whatsapp'] },
      ]
    },
    {
      key: 'logic',
      title: 'Logic & Flow',
      items: [
          { key: 'condition', label: 'Set a Condition', icon: 'GitFork', type: 'logic', color: NODE_COLORS[0], description: 'Branch the flow based on conditions' },
          { key: 'delay', label: 'Add a Delay', icon: 'Timer', type: 'logic', color: NODE_COLORS[0], description: 'Pause the flow for a specific duration' },
          { key: 'updateAttribute', label: 'Update Attribute', icon: 'PenSquare', type: 'logic', color: NODE_COLORS[0], description: 'Update a contact or flow variable' },
          { key: 'goto', label: 'Go to another step', icon: 'MoveRight', type: 'logic', color: NODE_COLORS[0], description: 'Jump to another node in the flow' },
          { key: 'end', label: 'End of Flow', icon: 'FlagOff', type: 'end', color: NODE_COLORS[0], description: 'Explicitly terminate the flow' },
      ]
    },
    {
      key: 'integrations',
      title: 'Integrations',
      items: [
          { key: 'apiCallout', label: 'Webhook', icon: 'Webhook', type: 'integrations', color: NODE_COLORS[3], description: 'Make an HTTP request to an external service' },
          { key: 'googleSheets', label: 'Google Sheets', icon: 'Table', type: 'integrations', color: NODE_COLORS[4], description: 'Append a row to a Google Sheet' },
      ]
    },
    {
      key: 'handoff',
      title: 'Handoff',
      items: [
          { key: 'assignTeam', label: 'Assign to Team', icon: 'Users', type: 'handoff', color: NODE_COLORS[5], description: 'Assign the conversation to a team' },
          { key: 'assignUser', label: 'Assign to User', icon: 'User', type: 'handoff', color: NODE_COLORS[5], description: 'Assign the conversation to a specific user' },
      ]
    }
  ]
