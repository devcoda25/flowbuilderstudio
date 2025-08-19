import { z } from 'zod'
import { WhatsAppRules } from '@/config/whatsapp-rules'
import type { MessageContext } from './types'

// ---- General
export const generalSchema = z.object({
  label: z.string().min(1, 'Label required'),
  icon: z.string().optional(),
  channel: z.string().optional()
})

// ---- Message
export function messageSchema(waCtx: MessageContext) {
  const qrCap = waCtx === 'template'
    ? WhatsAppRules.template.quickReplyMax
    : WhatsAppRules.interactive.replyButtonsInSessionMax

  return z.object({
    channelOverride: z.string().optional(), // per-node channel override
    content: z.string().min(1, 'Message text required').max(4096),
    quickReplies: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string()
          .min(1, 'Label required')
          .max(WhatsAppRules.template.quickReplyLabelMaxChars, `Max ${WhatsAppRules.template.quickReplyLabelMaxChars} chars`)
      })
    ).max(qrCap, `Too many quick replies for ${waCtx}. Max ${qrCap}.`).optional(),
    attachments: z.array(z.object({
      id: z.string(),
      url: z.string().url('Valid URL required'),
      type: z.enum(['image','video','file','audio']).default('image')
    })).optional()
  })
}

// ---- API
export const apiSchema = z.object({
  method: z.enum(['GET','POST','PUT','PATCH','DELETE']).default('POST'),
  url: z.string().url('Valid URL required'),
  headers: z.array(z.object({ key: z.string().min(1), value: z.string() })).optional(),
  body: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try { JSON.parse(val) } catch { return false }
    return true;
  }, { message: 'Body must be valid JSON' })
})

// ---- Logic
export const logicSchema = z.object({
  expression: z.string().min(1, 'Expression required').max(2000),
  defaultBranch: z.string().optional()
})

// ---- Schedule
export const scheduleSchema = z.object({
  mode: z.enum(['delay','datetime']).default('delay'),
  delayMinutes: z.number().int().min(0).max(7*24*60).optional(),
  runAt: z.string().optional() // ISO datetime when mode === datetime
}).refine((v) => (v.mode === 'delay' ? typeof v.delayMinutes === 'number' : !!v.runAt), {
  message: 'Provide delay minutes or a run date/time depending on mode.'
})

// ---- Campaign
export const campaignSchema = z.object({
  name: z.string().min(1),
  tags: z.array(z.string().min(1)).optional(),
  windowHours: z.number().int().min(1).max(72).default(24)
})

// ---- AI
export const aiSchema = z.object({
  model: z.string().min(1),
  temperature: z.number().min(0).max(1).default(0.3),
  systemPrompt: z.string().max(2000).optional()
})

// ---- Handoff
export const handoffSchema = z.object({
  queue: z.string().min(1),
  priority: z.number().int().min(0).max(10).default(5),
  note: z.string().max(500).optional()
})

// ---- Analytics
export const analyticsSchema = z.object({
  eventName: z.string().min(1),
  propertiesJson: z.string().optional().refine((val) => {
    if (!val) return true;
    try { JSON.parse(val) } catch { return false }
    return true
  }, 'Properties must be valid JSON')
})

// ---- Subflow
export const subflowSchema = z.object({
  targetFlowId: z.string().min(1, 'Select a sub‑flow'),
  passVars: z.record(z.string(), z.string()).optional()
})

// ---- Google Sheets
export const googleSheetsSchema = z.object({
  googleAccountId: z.string().optional(),
});
