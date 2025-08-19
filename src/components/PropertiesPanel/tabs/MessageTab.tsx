
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import styles from '../properties-panel.module.css'
import { WhatsAppRules } from '@/config/whatsapp-rules'
import type { MessageContext } from '../types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

export default function MessageTab({ waContext = 'template', channels }: { waContext?: MessageContext; channels?: string[] }) {
  const { register, control, formState: { errors }, watch, getValues } = useFormContext()
  
  const nodeLabel = getValues('label');
  const isButtonsOrList = nodeLabel === 'Buttons' || nodeLabel === 'List';
  const isMessagingNode = getValues('type') === 'messaging';

  const { fields, append, remove } = useFieldArray({ control, name: 'quickReplies' })

  const qrCap = waContext === 'template'
    ? WhatsAppRules.template.quickReplyMax
    : WhatsAppRules.interactive.replyButtonsInSessionMax

  const currentQr = watch('quickReplies') ?? []
  const over = currentQr.length > qrCap

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader>
          <CardTitle>Message Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.field}>
            <Label htmlFor="message-text">Message Text</Label>
            <Textarea id="message-text" {...register('content')} rows={5} placeholder="Type the message…"/>
            {errors.content && <span className={styles.err}>{String(errors.content.message)}</span>}
          </div>
        </CardContent>
      </Card>
      
      {isMessagingNode && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Reply Buttons</CardTitle>
            <CardDescription>
              Add buttons to guide the user's response.
              <span className="block mt-1 text-xs font-semibold text-primary">{`WhatsApp Limit: ${qrCap} replies for ${waContext} context.`}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
              <ul className={styles.list}>
                {fields.map((f, i) => (
                  <li key={f.id} className={styles.listItem}>
                    <Input
                      placeholder={`Button ${i + 1} label`}
                      {...register(`quickReplies.${i}.label` as const)}
                      maxLength={WhatsAppRules.template.quickReplyLabelMaxChars}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {Array.isArray(errors.quickReplies) && errors.quickReplies[i]?.label && (
                      <span className={styles.err}>{String(errors.quickReplies[i]?.label?.message)}</span>
                    )}
                  </li>
                ))}
              </ul>
              {over && <div className={styles.warn}>Too many buttons. Remove {currentQr.length - qrCap}.</div>}

              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ id: crypto.randomUUID(), label: '' })}
                  disabled={currentQr.length >= qrCap}
                >+ Add Button</Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
