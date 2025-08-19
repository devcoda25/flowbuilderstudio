import React, { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './properties-panel.module.css'

import { TAB_KEYS, type PropertiesPanelProps, type TabKey } from './types'
import { generalSchema, messageSchema, apiSchema, logicSchema, scheduleSchema, campaignSchema, aiSchema, handoffSchema, analyticsSchema, subflowSchema, googleSheetsSchema } from './schemas'
import GeneralTab from './tabs/GeneralTab'
import MessageTab from './tabs/MessageTab'
import APITab from './tabs/APITab'
import LogicTab from './tabs/LogicTab'
import ScheduleTab from './tabs/ScheduleTab'
import CampaignTab from './tabs/CampaignTab'
import AITab from './tabs/AITab'
import HandoffTab from './tabs/HandoffTab'
import AnalyticsTab from './tabs/AnalyticsTab'
import SubflowTab from './tabs/SubflowTab'
import GoogleSheetsTab from './tabs/GoogleSheetsTab'
import { useDebouncedCallback } from './utils/useDebouncedCallback'
import { useKeybind } from './utils/useKeybind'

/** Simple class combiner */
function cn(...parts: Array<string | false | undefined>) { return parts.filter(Boolean).join(' ') }

const TAB_LABEL: Record<TabKey, string> = {
  general: 'General', message: 'Message', api: 'API/Webhook', logic: 'Logic',
  schedule: 'Schedule', campaign: 'Campaign', ai: 'AI Assist', handoff: 'Handoff',
  analytics: 'Analytics', subflow: 'Sub‑flow', googleSheets: 'Google Sheets'
}

export default function PropertiesPanel({
  node,
  onSave,
  onClose,
  waContext = 'template',
  channels,
  open
}: PropertiesPanelProps) {
  const visible = !!node && (open ?? true)
  const [activeTab, setActiveTab] = useState<TabKey>('general')

  // choose schema per active tab (keep lightweight & fast)
  const schema = useMemo(() => {
    switch (activeTab) {
      case 'general': return generalSchema
      case 'message': return messageSchema(waContext)
      case 'api': return apiSchema
      case 'logic': return logicSchema
      case 'schedule': return scheduleSchema
      case 'campaign': return campaignSchema
      case 'ai': return aiSchema
      case 'handoff': return handoffSchema
      case 'analytics': return analyticsSchema
      case 'subflow': return subflowSchema
      case 'googleSheets': return googleSheetsSchema
      default: return generalSchema
    }
  }, [activeTab, waContext])

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: (node?.data as any) || {},
    mode: 'onChange'
  })

  // reset form when node or tab changes
  useEffect(() => {
    methods.reset((node?.data as any) || {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id, activeTab])

  // close on Esc
  useKeybind('Escape', (e) => { if (visible) { e.preventDefault(); onClose() } })

  // debounced autosave (tab‑scoped)
  const debouncedSave = useDebouncedCallback((vals: any) => {
    if (!node) return
    onSave(node.id, vals)
  }, 400)

  useEffect(() => {
    const sub = methods.watch((vals) => debouncedSave(vals))
    return () => sub.unsubscribe()
  }, [methods, debouncedSave])

  const availableTabs = useMemo(() => {
    if (!node?.data?.type) {
      return TAB_KEYS;
    }
    const nodeTypeTabs = {
      triggers: ['general', 'schedule'],
      messaging: ['general', 'message', 'schedule'],
      inputs: ['general', 'message', 'schedule'],
      logic: ['general', 'logic', 'schedule'],
      integrations: ['general', 'api', 'googleSheets', 'schedule'],
      handoff: ['general', 'handoff', 'schedule'],
      end: ['general', 'analytics'],
    }[node.data.type];

    if (node.data.label === 'Google Sheets') {
      return ['general', 'googleSheets', 'schedule'];
    }
    
    if (node.data.label === 'Set a Condition') {
      return ['general', 'logic', 'schedule'];
    }

    if (node.data.type === 'integrations' && node.data.label !== 'Google Sheets') {
      return ['general', 'api', 'schedule'];
    }

    return nodeTypeTabs || TAB_KEYS;
  }, [node]);

  const TabComp = {
    general: GeneralTab,
    message: () => <MessageTab waContext={waContext} channels={channels} />,
    api: APITab,
    logic: LogicTab,
    schedule: ScheduleTab,
    campaign: CampaignTab,
    ai: AITab,
    handoff: HandoffTab,
    analytics: AnalyticsTab,
    subflow: SubflowTab,
    googleSheets: GoogleSheetsTab,
  }[activeTab] as React.FC<any>


  if (!visible) return null;

  return (
    <aside className={styles.root} role="dialog" aria-label="Node properties" aria-modal="true">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Node Properties</h2>
          <p className={styles.subtitle}>{node?.data?.label ?? node?.id}</p>
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Close properties">×</button>
      </div>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Properties tabs">
        {availableTabs.map((k) => (
          <button
            key={k}
            className={cn(styles.tab, activeTab === k && styles.tabActive)}
            onClick={async () => {
              // validate before switching tab (so users see errors)
              await methods.trigger()
              setActiveTab(k)
            }}
          >
            {TAB_LABEL[k]}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className={styles.body}>
        <FormProvider {...methods}>
          <TabComp />
        </FormProvider>
      </div>

      {/* Footer with live validation */}
      <div className={styles.footer}>
        <ValidationSummary errors={methods.formState.errors} />
        <span className={styles.tip}>Changes autosave • Press Esc to close</span>
      </div>
    </aside>
  )
}

function ValidationSummary({ errors }: { errors: Record<string, any> }) {
  const list = Object.entries(errors)
    .map(([k, v]) => ({ field: k, msg: (v as any)?.message || 'Invalid value' }))

  if (list.length === 0) return <span className={styles.ok}>All good ✓</span>
  return (
    <ul className={styles.problems} aria-live="polite">
      {list.map((e) => (
        <li key={e.field} className={styles.problemItem}>
          <span className={styles.problemField}>{e.field}</span>
          <span className={styles.problemMsg}>{String(e.msg)}</span>
        </li>
      ))}
    </ul>
  )
}
