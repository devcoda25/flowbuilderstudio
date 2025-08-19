/**
 * WhatsApp rules pulled from partner docs and Meta guidance.
 * We separate Template vs In-Session contexts.
 *
 * Template: up to 10 quick replies and 10 total buttons (incl. CTAs).  (Infobip, Genesys, Twilio)
 * In-session interactive reply-buttons: up to 3.                      (Meta interactive docs)
 *
 * Keep configurable so we can hot-update without redeploy.
 */
export const WhatsAppRules = {
  sessionWindowHours: 24,
  interactive: {
    // in-session "reply buttons" message type
    replyButtonsInSessionMax: 3 // Meta interactive reply buttons messages
  },
  template: {
    quickReplyMax: 10,          // partners indicate up to 10 quick replies per template
    totalButtonsMax: 10,        // total buttons (QR + CTAs) per template
    ctaLimits: { urlMax: 2, phoneMax: 1, promoMax: 1 }, // typical partner guidance
    quickReplyLabelMaxChars: 25 // partner guidance ranges 20-25; configurable
  },
  listMessage: {
    optionsMax: 10              // list menu options per message
  }
}

export type WaMessageContext = 'template' | 'in-session'
