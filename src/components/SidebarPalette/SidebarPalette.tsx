
'use client';

import React, { useMemo } from 'react';
import { SECTION_DATA, ItemDefinition, PaletteItemPayload, Channel } from './sections-data';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './sidebar-palette.module.css';

export type SidebarPaletteProps = {
  onDragStart: (e: React.DragEvent, item: PaletteItemPayload) => void;
  onItemClick?: (item: PaletteItemPayload) => void;
  filterChannels?: Channel[];
  className?: string;
};

export default function SidebarPalette({
  onDragStart,
  onItemClick,
  filterChannels,
  className,
}: SidebarPaletteProps) {
  
  const allItems = useMemo<ItemDefinition[]>(() => {
    let items: ItemDefinition[] = SECTION_DATA.flatMap(sec => sec.items);
    if (!filterChannels || filterChannels.length === 0) return items;
    
    const allowed = new Set(filterChannels);
    return items.filter((it) => !it.channels || it.channels.some((c) => allowed.has(c)));
  }, [filterChannels]);


  function toPayload(it: ItemDefinition): PaletteItemPayload {
    return { 
        key: it.key, 
        label: it.label, 
        icon: it.icon as string, 
        type: it.type, 
        color: it.color, 
        description: it.description,
        content: it.content,
        quickReplies: it.quickReplies,
    };
  }


  function handleDragStart(e: React.DragEvent, item: ItemDefinition) {
    const payload = toPayload(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-flow-node', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', item.label);
    
    // Create a custom drag image that looks like the node
    const ghost = document.createElement('div');
    ghost.className = "flex flex-col items-center justify-center text-center gap-2 p-3 rounded-lg shadow-xl bg-card text-card-foreground border border-border";
    ghost.style.width = '150px'; // Match the button width
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px'; // Position it off-screen

    const iconContainer = document.createElement('div');
    iconContainer.className = "w-10 h-10 rounded-full grid place-items-center bg-primary/10 flex-shrink-0";
    
    const Icon = (LucideIcons as any)[item.icon as string] || LucideIcons.HelpCircle;
    
    // This is tricky, we can't easily render a React component to an image.
    // We will build a simple representation. For a perfect match, we'd need a library.
    const iconElement = document.createElement('div');
    iconElement.style.color = 'hsl(var(--primary))';
    iconElement.innerHTML = `<!-- Approximating icon, actual SVG might differ -->`;
    iconContainer.appendChild(iconElement);

    const labelElement = document.createElement('span');
    labelElement.className = "text-sm font-medium leading-snug";
    labelElement.innerText = item.label;

    ghost.appendChild(iconContainer);
    ghost.appendChild(labelElement);

    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 75, 40); // Center the drag image on the cursor

    // Clean up the ghost element
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
    
    onDragStart(e, payload);
  }

  function handleItemClick(item: ItemDefinition) {
    const payload = toPayload(item);
    onItemClick?.(payload);
  }
  
  return (
    <nav className={cn("h-full flex flex-col gap-6 overflow-y-auto", className)} aria-label="Node palette">
        {SECTION_DATA.map(section => (
            <div key={section.key}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{section.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                    {section.items.map(item => {
                        const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] ?? LucideIcons.HelpCircle : item.icon;
                        const isVisible = !filterChannels || filterChannels.length === 0 || !item.channels || item.channels.some(c => filterChannels.includes(c));
                        
                        if (!isVisible) return null;

                        return (
                        <button
                            key={item.key}
                            type="button"
                            className={styles.paletteItem}
                            style={{'--item-color': item.color} as React.CSSProperties}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onClick={() => handleItemClick(item)}
                            aria-label={`Add ${item.label}`}
                            title={`${item.label}${item.description ? ` - ${item.description}`:''}`}
                        >
                            <div className={styles.paletteItemIconWrapper}>
                                <Icon className={styles.paletteItemIcon} />
                            </div>
                            <span className={styles.paletteItemLabel}>{item.label}</span>
                        </button>
                        )
                    })}
                </div>
            </div>
        ))}
    </nav>
  );
}
