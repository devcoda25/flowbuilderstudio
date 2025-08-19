'use client';
import React, { useEffect, useMemo, useState } from 'react';
import styles from '../test-console.module.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function VoicePreview({ ttsText }: { ttsText?: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIdx, setVoiceIdx] = useState<number>(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    function populate() {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoiceIndex = availableVoices.findIndex(v => v.default);
      setVoiceIdx(defaultVoiceIndex > -1 ? defaultVoiceIndex : 0);
    }
    populate();
    window.speechSynthesis.onvoiceschanged = populate;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (!ttsText || typeof window === 'undefined' || !('speechSynthesis' in window) || voices.length === 0) return;
    const u = new SpeechSynthesisUtterance(ttsText);
    u.voice = voices[voiceIdx];
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [ttsText, voices, voiceIdx, rate, pitch]);

  const canSpeak = useMemo(() => typeof window !== 'undefined' && 'speechSynthesis' in window, []);

  if (!canSpeak) {
      return <div className={styles.muted}>Web Speech not supported in this browser.</div>
  }
  
  return (
    <div className={styles.voiceRoot}>
        <div className={styles.voiceControls}>
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={String(voiceIdx)} onValueChange={(v) => setVoiceIdx(Number(v))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    {voices.map((v, i) => <SelectItem key={v.name + i} value={String(i)}>{v.name} ({v.lang})</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rate ({rate.toFixed(1)})</Label>
            <Slider defaultValue={[rate]} min={0.5} max={1.5} step={0.1} onValueChange={(v) => setRate(v[0])} />
          </div>
           <div className="space-y-2">
            <Label>Pitch ({pitch.toFixed(1)})</Label>
            <Slider defaultValue={[pitch]} min={0.5} max={1.5} step={0.1} onValueChange={(v) => setPitch(v[0])} />
          </div>
        </div>
        <div className={styles.muted}>Last bot message is spoken automatically.</div>
    </div>
  );
}
