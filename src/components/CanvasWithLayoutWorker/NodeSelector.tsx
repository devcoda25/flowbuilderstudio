
'use client';

import React, { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { SECTION_DATA, ItemDefinition, PaletteItemPayload } from '@/components/SidebarPalette/sections-data';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

type NodeSelectorProps = {
  onSelect: (item: PaletteItemPayload) => void;
  onClose: () => void;
};

export default function NodeSelector({ onSelect, onClose }: NodeSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    if (!search) {
      return SECTION_DATA.flatMap(sec => sec.items);
    }
    const lowerSearch = search.toLowerCase();
    return SECTION_DATA.flatMap(sec => sec.items).filter(
      item =>
        item.label.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch)
    );
  }, [search]);

  function toPayload(it: ItemDefinition): PaletteItemPayload {
    return { key: it.key, label: it.label, icon: it.icon as string, type: it.type, color: it.color, description: it.description };
  }

  return (
    <div className="w-64 bg-card border border-border rounded-lg shadow-xl flex flex-col relative">
       <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={onClose}>
        <X className="w-4 h-4" />
      </Button>
      <div className="p-2 border-b border-border">
        <Input
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-1">
          {filteredItems.map(item => {
            const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] ?? LucideIcons.HelpCircle : item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(toPayload(item))}
                className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-accent/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-md grid place-items-center bg-primary/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-muted-foreground p-4">No nodes found.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
