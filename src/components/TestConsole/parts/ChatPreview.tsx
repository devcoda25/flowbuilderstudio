
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../test-console.module.css';
import type { Channel, ChatMessage, QuickReply, Attachment } from '../types';
import { smsSegments } from '../utils/sms';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, ImageIcon, Music, Video } from 'lucide-react';

function cn(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(' '); }

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
    switch (attachment.type) {
        case 'image': 
            return <img src={attachment.url} alt={attachment.name || 'image'} className={styles.attImage} />;
        case 'video': 
            return (
                <div className={styles.attIconWrapper}>
                    <Video className="h-6 w-6" />
                    <span>{attachment.name || 'video'}</span>
                </div>
            );
        case 'audio':
            return (
                 <div className={styles.attIconWrapper}>
                    <Music className="h-6 w-6" />
                    <span>{attachment.name || 'audio'}</span>
                </div>
            );
        default: 
            return (
                 <div className={styles.attIconWrapper}>
                    <FileText className="h-6 w-6" />
                    <span>{attachment.name || 'file'}</span>
                </div>
            );
    }
}


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
            {msg.text && <div className={styles.bubbleText} dangerouslySetInnerHTML={{ __html: msg.text }}></div>}
            
            {msg.attachments && msg.attachments.length > 0 && (
              <div className={styles.attRow}>
                {msg.attachments.map(a => (
                  <div key={a.id} className={styles.attChip}>
                    <AttachmentPreview attachment={a} />
                  </div>
                ))}
              </div>
            )}

            {msg.actions?.buttons && msg.actions.buttons.length > 0 && (
              <div className={styles.actionRow}>
                {(msg.actions.buttons ?? []).map(b => <button key={b.id} className={styles.qrBtn} onClick={() => onUserReply(b.label)}>{b.label}</button>)}
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
