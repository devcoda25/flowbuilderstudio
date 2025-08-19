import { z } from 'zod'

export const delaySchema = z.object({
  value: z.number().int().min(0),
  unit: z.enum(['s','m','h','d'])
})

export const branchSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Branch label required'),
  condition: z.string().min(1, 'Condition required'),
  delay: delaySchema.optional(),
  target: z.string().optional(),
  isElse: z.boolean().optional(),
  disabled: z.boolean().optional()
}).refine((b) => b.isElse ? (b.condition.trim() === 'true' || b.condition.trim() === '') : true, {
  message: 'ELSE branches should have empty or `true` as condition.',
  path: ['condition']
})

export const logicSchema = z.object({
  expression: z.string().optional(),
  branches: z.array(branchSchema).min(1, 'Add at least one branch')
})
