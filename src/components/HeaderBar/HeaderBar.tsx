'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './header-bar.module.css';
import { CHANNELS, Channel, MessageContext } from './channel-meta';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Undo, Redo, TestTube, Save, ChevronDown, Check } from 'lucide-react';
import { publishFlow } from '@/api/flows';
import { usePresence } from '@/presence/PresenceProvider';

/** Handy class combiner without bringing in a dependency */
function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export type HeaderBarProps = {
  /** Optional externally controlled title; if omitted, `initialTitle` seeds local state */
  title?: string;
  initialTitle?: string;
  channels: Channel[];
  availableChannels?: Channel[]; // default = all
  onChannelsChange: (next: Channel[]) => void;

  // WhatsApp context (for validation elsewhere). Rendered only if WhatsApp is selected.
  waContext?: MessageContext; // 'template' | 'in-session'
  onWaContextChange?: (ctx: MessageContext) => void;

  // Editing / saving
  onSave?: (title: string) => void; // debounced save callback

  // Undo/Redo
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Actions
  onTest: () => void;
  onPublishToggle: (next: boolean) => void;
  onSaveClick?: () => void;
  isPublished?: boolean;

  className?: string;
};

export default function HeaderBar({
  title,
  initialTitle = 'Untitled Flow',
  channels,
  availableChannels,
  onChannelsChange,
  waContext,
  onWaContextChange,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onTest,
  onPublishToggle,
  onSaveClick,
  isPublished = false,
  className,
}: HeaderBarProps) {
  const controlled = typeof title === 'string';
  const [localTitle, setLocalTitle] = useState<string>(title ?? initialTitle);
  const currentTitle = controlled ? (title as string) : localTitle;
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const originalRef = useRef(currentTitle);

  useEffect(() => {
    if (controlled) return;
    setLocalTitle((t) => (t !== currentTitle ? currentTitle : t));
  }, [title, controlled, currentTitle]);

  const debouncedSave = useDebouncedCallback((val: string) => {
    if (val.trim().length === 0) val = 'Untitled Flow';
    if (val !== originalRef.current) {
      onSave?.(val);
      originalRef.current = val;
    }
  }, 500);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const allChannels = useMemo(
    () =>
      availableChannels && availableChannels.length
        ? CHANNELS.filter((c) => availableChannels.includes(c.id))
        : CHANNELS,
    [availableChannels]
  );
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function toggleChannel(ch: Channel) {
    const set = new Set(channels);
    set.has(ch) ? set.delete(ch) : set.add(ch);
    onChannelsChange(Array.from(set));
  }

  const headerId = useId();
  const selectedMeta = allChannels.filter((c) => channels.includes(c.id));
  const MAX_BADGES = 4;
  const overflow = Math.max(0, selectedMeta.length - MAX_BADGES);
  const showBadges = selectedMeta.slice(0, MAX_BADGES);

  function commitTitle(val: string) {
    const trimmed = val.trim().length ? val : 'Untitled Flow';
    if (!controlled) setLocalTitle(trimmed);
    debouncedSave(trimmed);
  }

  function onTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (!controlled) setLocalTitle(originalRef.current);
      setEditing(false);
    }
  }

  function handlePublishToggle(next: boolean) {
    onPublishToggle(next);
  }


  return (
    <header className={cn(styles.header, className)} aria-labelledby={headerId}>
      <h2 id={headerId} className={styles.visuallyHidden}>
        Flow Builder Header
      </h2>
      <div className={styles.left}>
        <div className={styles.channels} ref={popRef}>
          <Button
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="channel-listbox"
            title="Select channels"
          >
            Channels <ChevronDown className="h-4 w-4" />
          </Button>
          <div className={styles.badges} aria-label="Selected channels">
            {showBadges.map((c) => (
              <span key={c.id} className={styles.badge} title={c.label}>
                {c.short}
              </span>
            ))}
            {overflow > 0 && (
              <span className={cn(styles.badge, styles.badgeMuted)} title={`${overflow} more`}>
                +{overflow}
              </span>
            )}
          </div>
          {open && (
            <div className={styles.popover}>
              <div className={styles.popHeader}>
                <span className={styles.popTitle}>Channels</span>
                <div className={styles.popActions}>
                  <button className={styles.mini} onClick={() => onChannelsChange(allChannels.map((c) => c.id))}>
                    Select all
                  </button>
                  <button className={styles.mini} onClick={() => onChannelsChange([])}>
                    Clear
                  </button>
                </div>
              </div>
              <ul id="channel-listbox" role="listbox" aria-multiselectable className={styles.list}>
                {allChannels.map((ch) => {
                  const checked = channels.includes(ch.id);
                  return (
                    <li
                      key={ch.id}
                      role="option"
                      aria-selected={checked}
                      className={styles.item}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleChannel(ch.id)}
                    >
                      <input type="checkbox" checked={checked} readOnly className="hidden" />
                      {checked ? <Check size={16} /> : <div className="w-4 h-4" />}
                      <span className={styles.itemLabel}>{ch.label}</span>
                      <span className={styles.itemShort}>{ch.short}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {channels.includes('whatsapp') && onWaContextChange && (
          <label className={styles.segment} aria-label="WhatsApp message context">
            <span className={styles.segmentLabel}>WA Context</span>
            <select
              className={styles.select}
              value={waContext ?? 'template'}
              onChange={(e) => onWaContextChange(e.target.value as MessageContext)}
            >
              <option value="template">Template</option>
              <option value="in-session">In‑session</option>
            </select>
          </label>
        )}
        <div className={styles.titleWrap}>
          {editing ? (
            <Input
              ref={inputRef}
              value={currentTitle}
              onChange={(e) => (controlled ? debouncedSave(e.target.value) : setLocalTitle(e.target.value))}
              onBlur={() => {
                setEditing(false);
                commitTitle(currentTitle);
              }}
              onKeyDown={onTitleKeyDown}
              className={styles.titleInput}
              aria-label="Flow title"
              maxLength={120}
            />
          ) : (
            <button
              type="button"
              className={styles.titleButton}
              onClick={() => setEditing(true)}
              title="Click to rename"
              aria-label="Flow title. Click to rename."
            >
              <span className={styles.titleText} title={currentTitle}>
                {currentTitle}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.group}>
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)">
            <Undo />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)">
            <Redo />
          </Button>
        </div>

        <Button variant="outline" onClick={onTest}>
          <TestTube className="mr-2 h-4 w-4" /> Test Flow
        </Button>

        <div className={styles.group}>
          {onSaveClick && (
            <Button variant="secondary" onClick={onSaveClick}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          )}
          <div className={styles.toggle}>
            <Label htmlFor="publish-toggle" className="sr-only">
              Publish flow
            </Label>
            <Switch id="publish-toggle" checked={!!isPublished} onCheckedChange={handlePublishToggle} />
            <span>{isPublished ? 'Published' : 'Draft'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
