// Mirrored from MessageBuilder utils (kept local for decoupling)
const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ {\\f}|^€[~]\\" +
  "!'#%&()*+,-./0123456789:;<=>?" +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'abcdefghijklmnopqrstuvwxyz';

export function isGsm7(text: string) {
  for (const ch of text) if (GSM7.indexOf(ch) === -1) return false;
  return true;
}

export function smsSegments(text: string) {
  const gsm = isGsm7(text);
  const single = gsm ? 160 : 70;
  const concat = gsm ? 153 : 67;
  if (text.length <= single) return { segments: text.length ? 1 : 0, remaining: single - text.length, limit: single, encoding: gsm ? 'GSM-7' : 'UCS-2' };
  const segments = Math.ceil(text.length / concat);
  const used = segments * concat;
  return { segments, remaining: used - text.length, limit: concat, encoding: gsm ? 'GSM-7' : 'UCS-2' };
}
