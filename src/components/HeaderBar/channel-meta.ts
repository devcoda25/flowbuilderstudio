// Channel metadata and strong typing for the selector.

export type Channel =
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'push'
  | 'voice'
  | 'instagram'
  | 'messenger'
  | 'webchat'
  | 'slack'
  | 'teams'
  | 'telegram'

export type MessageContext = 'template' | 'in-session'

export interface ChannelMeta {
  id: Channel
  label: string
  short: string // 2–3 letters for compact badges
}

export const CHANNELS: ChannelMeta[] = [
  { id: 'whatsapp',  label: 'WhatsApp',   short: 'WA' },
  { id: 'sms',       label: 'SMS',        short: 'SM' },
  { id: 'email',     label: 'Email',      short: 'EM' },
  { id: 'push',      label: 'Push',       short: 'PU' },
  { id: 'voice',     label: 'Voice',      short: 'VO' },
  { id: 'instagram', label: 'Instagram',  short: 'IG' },
  { id: 'messenger', label: 'Messenger',  short: 'FB' },
  { id: 'webchat',   label: 'WebChat',    short: 'WC' },
  { id: 'slack',     label: 'Slack',      short: 'SL' },
  { id: 'teams',     label: 'Teams',      short: 'MS' },
  { id: 'telegram',  label: 'Telegram',   short: 'TG' }
]
