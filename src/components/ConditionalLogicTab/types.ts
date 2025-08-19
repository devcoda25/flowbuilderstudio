import type { VariableSpec } from "@/components/ExpressionBuilder";

export type DelayUnit = 's' | 'm' | 'h' | 'd'

export type Branch = {
  id: string
  label: string
  condition: string   // JS expression, must evaluate to boolean
  delay?: { value: number; unit: DelayUnit } // Delay before moving to next
  target?: string     // optional: future "route to" ID/label
  isElse?: boolean    // fallback branch
  disabled?: boolean
}

export type LogicValue = {
  expression?: string // optional global guard expression
  branches: Branch[]
}

export type ConditionalLogicTabProps = {
  /** Entire node form values (we’ll read/write only logic fields) */
  value: Record<string, any>
  /** Return the updated form object (we’ll hand you back everything) */
  onChange: (next: Record<string, any>) => void
  /** Variables to expose in the ExpressionBuilder & simulator */
  variables?: VariableSpec[]
  /** Optional list of destinations to show in a "Route to" dropdown */
  branchTargets?: { id: string; label: string }[]
  /** Seed JSON for the simulator */
  initialTestContext?: Record<string, unknown>
  className?: string
}
