import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import styles from '../properties-panel.module.css'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function GeneralTab() {
  const { control, register, formState: { errors } } = useFormContext()

  return (
    <div className={styles.tabBody}>
      <Card>
        <CardHeader>
          <CardTitle>Node Details</CardTitle>
          <CardDescription>Basic information for this node.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={styles.field}>
            <Label>Label</Label>
            <Input {...register('label')} />
            {errors.label && <span className={styles.err}>{String(errors.label.message)}</span>}
          </div>

          <div className={styles.field}>
            <Label>Icon (from Lucide)</Label>
            <Input {...register('icon')} placeholder="e.g. MessageSquare" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Channel Override</CardTitle>
          <CardDescription>Force this node to use a specific channel, overriding the flow's default.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.field}>
            <Label>Channel</Label>
            <Controller
                control={control}
                name="channel"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="— Default —" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">— Default —</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
