import React from 'react'
import { useFormContext } from 'react-hook-form'
import ConditionalLogicTab from '@/components/ConditionalLogicTab'

export default function LogicTab() {
  const { getValues, reset } = useFormContext()

  const variables = [
    { name: 'country', label: 'Country Code', type: 'string' },
    { name: 'age', label: 'User Age', type: 'number' },
    { name: 'message', label: 'Last Message', type: 'string' },
    { name: 'lastSeenAt', label: 'Last Seen (date)', type: 'date' },
  ]
  
  return (
      <ConditionalLogicTab
        value={getValues()}
        onChange={(v) => reset(v, { keepDirty: true })}
        variables={variables}
        initialTestContext={{ country: 'US', age: 21, message: 'refund please' }} // optional
        branchTargets={[
          // optional: show a "Route to" dropdown (could be node ids)
          { id: 'continue', label: 'Continue' },
          { id: 'end', label: 'End Session' }
        ]}
      />
  )
}
