export type VariableSpec = {
  /** Identifier name used inside expressions, e.g. "user.age" or "country" */
  name: string;
  /** Optional human label for UI surfaces */
  label?: string;
  /** Optional type hint to show in completion */
  type?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'unknown';
};

export type HelperSpec = {
  name: string;
  /** Display signature, e.g., "includes(text, part)" */
  signature: string;
  /** Tiny doc shown in completion details */
  doc?: string;
};

export type ExpressionBuilderProps = {
  value: string;
  onChange: (next: string) => void;

  /** Variables available in the expression (dot paths are okay). */
  variables?: VariableSpec[];

  /** Optional starting JSON for the Test panel context. */
  initialTestContext?: Record<string, unknown>;

  /** Extra helper functions you'd like to expose in the Test runner & autocomplete. */
  helpers?: HelperSpec[];

  /** Component height in pixels (editor area). Default: 160 */
  height?: number;

  /** Readonly mode for preview pages. */
  readOnly?: boolean;

  /** Optional className for the outer wrapper. */
  className?: string;
};
