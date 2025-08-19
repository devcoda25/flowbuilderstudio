/**
 * Demo‑grade evaluator. It compiles an expression as a function with strict mode,
 * injecting (helpers, ...context) as parameters.
 *
 * NOTE: Do not use this in production without additional hardening. For real apps,
 * evaluate server‑side or in a hardened sandbox/worker and apply allow‑lists.
 */
export function safeEval(expr: string, ctx: Record<string, unknown>, helpers: Record<string, Function>) {
  // block obviously dangerous tokens
  const banned = /(import|export|await|function\s*\(|=>|new\s+Function|constructor|window|document|eval)/g;
  if (banned.test(expr)) {
    throw new Error('Expression contains disallowed syntax.');
  }

  const helperNames = Object.keys(helpers);
  const names = Object.keys(ctx);
  const values = Object.values(ctx);

  const fn = new Function(...helperNames, ...names, '"use strict"; return ( ' + expr + ' );');
  return fn(...Object.values(helpers), ...values);
}

/** A tiny default helper library, safe & pure. */
export function defaultHelpers() {
  return {
    len: (x: any) => (typeof x === 'string' || Array.isArray(x)) ? x.length : 0,
    includes: (text: any, part: any) => (String(text)).includes(String(part)),
    startsWith: (text: any, part: any) => String(text).startsWith(String(part)),
    endsWith: (text: any, part: any) => String(text).endsWith(String(part)),
    regex: (pattern: string, flags?: string) => new RegExp(pattern, flags),
    inList: (x: any, list: any[]) => list.includes(x),
    minutesSince: (iso: string) => {
      const then = Date.parse(iso); if (!then) return NaN;
      return Math.floor((Date.now() - then) / 60000);
    },
    toLower: (s: any) => String(s).toLowerCase(),
    toUpper: (s: any) => String(s).toUpperCase()
  };
}
