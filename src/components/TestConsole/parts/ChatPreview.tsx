'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../test-console.module.css';
import type { Channel, ChatMessage, QuickReply } from '../types';
import { smsSegments } from '../utils/sms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' '); }

export default function ChatPreview({
  messages,
  channel,
  onUserReply,
  autoScroll = true
}: {
  messages: ChatMessage[];
  channel: Channel;
  onUserReply: (text: string) => void;
  autoScroll?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState('');

  const quickReplies: QuickReply[] = useMemo(() => {
    const lastBot = [...messages].reverse().find(m => m.from === 'bot');
    return lastBot?.actions?.buttons ?? [];
  }, [messages]);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, autoScroll]);

  function send() {
    const val = text.trim();
    if (!val) return;
    onUserReply(val);
    setText('');
  }

  return (
    <div className={styles.chatRoot}>
      <div ref={scrollRef} className={cn(styles.chatScroll, styles[`theme_${channel}`])}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn(styles.bubble, msg.from === 'user' ? styles.user : msg.from === 'bot' ? styles.bot : styles.system)}>
            {msg.text && <div className={styles.bubbleText}>{msg.text}</div>}
            
            {msg.actions?.buttons && msg.actions.buttons.length > 0 && (
              <div className={styles.actionRow}>
                {(msg.actions.buttons ?? []).map(b => <button key={b.id} className={styles.qrBtn} onClick={() => onUserReply(b.label)}>{b.label}</button>)}
              </div>
            )}

            {msg.attachments && msg.attachments.length > 0 && (
              <div className={styles.attRow}>
                {msg.attachments.map(a => <span key={a.id} className={styles.attChip}>{a.type.toUpperCase()}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      {channel !== 'voice' && (
        <div className={styles.inputRow}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a reply…"
          />
          <Button onClick={send}>Send</Button>
        </div>
      )}
    </div>
  );
}
