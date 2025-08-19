/** Very small mustache-like variable expansion: "Hello {{name}}!" */
export function renderTemplate(tpl: string, vars: Record<string, any>) {
  return tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    try {
        const val = key.split('.').reduce((o, k) => (o ? o[k] : undefined), vars as any);
        return val == null ? '' : String(val);
    } catch {
        return '';
    }
  });
}

/**
 * Expression evaluator used by Condition nodes.
 * Supports JS expressions referencing `vars` (e.g., `vars.age > 18 && vars.country === "US"`).
 * NOTE: for test/dev usage only; do not use for untrusted user expressions in production.
 */
export function evalExpression(expr: string, vars: Record<string, any>) {
  try {
    const f = new Function('vars', `"use strict"; return (${expr});`);
    return !!f(vars);
  } catch {
    return false;
  }
}

/** Parses delay strings like "30 m", "5s", "1200ms", or numeric milliseconds. */
export function parseDelay(input: string | number | undefined): number {
  if (typeof input === 'number' && isFinite(input)) return Math.max(0, input);
  if (!input || typeof input !== 'string') return 0;
  const s = String(input).trim().toLowerCase();
  const m = s.match(/^(\d+(?:\.\d+)?)(\s*(ms|s|m|h))?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[3] || 'ms') as 'ms' | 's' | 'm' | 'h';
  const mult = unit === 'ms' ? 1 : unit === 's' ? 1000 : unit === 'm' ? 60000 : 3600000;
  return Math.round(n * mult);
}
