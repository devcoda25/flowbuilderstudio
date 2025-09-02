
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, Position, Node as ReactFlowNode, useReactFlow } from 'reactflow';
import styles from '../canvas-layout.module.css';
import listNodeStyles from './list-node.module.css';
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2, Copy, PlayCircle, XCircle, Settings, File as FileIcon, Film, Music, FileQuestion, FileSpreadsheet, FileJson, Paperclip, FileText, Send } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useFlowStore } from '@/store/flow';
import { Badge } from '@/components/ui/badge';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';
import { useClickAway } from 'react-use';
import { cn } from '@/lib/utils';
import { MediaPart } from '@/types/MediaPart';
import Image from 'next/image';

const RichTextEditor = dynamic(() => import('@/components/PropertiesPanel/partials/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2">Loading editor...</div>,
});

export type ContentPart =
  | { id: string; type: 'text'; content: string }
  | ({ id: string } & MediaPart);

const MEDIA_TYPES: MediaPart['type'][] = ['image', 'video', 'audio', 'document'];

const isMediaPart = (
  part: ContentPart
): part is { id: string } & MediaPart => {
  return MEDIA_TYPES.includes(part.type as MediaPart['type']);
};

const migrateData = (data: BaseNodeData): BaseNodeData => {
  if (typeof data.content === 'string' && !data.parts) {
    return { ...data, parts: [{ id: nanoid(), type: 'text', content: data.content }] };
  }
  if (!data.parts) {
    return { ...data, parts: [{ id: nanoid(), type: 'text', content: '' }] };
  }
  return data;
};

const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileIcon className="w-8 h-8" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'mp3':
        case 'wav': return <Music className="w-8 h-8 text-orange-500" />;
        case 'mp4':
        case 'mov': return <Film className="w-8 h-8 text-purple-500" />;
        case 'pdf':
        case 'docx':
        case 'txt': return <FileText className="w-8 h-8 text-blue-500" />;
        case 'csv':
        case 'xlsx': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
        case 'json': return <FileJson className="w-8 h-8 text-yellow-500" />;
        default: return <FileQuestion className="w-8 h-8 text-muted-foreground" />;
    }
};

export type QuickReply = { id: string; label: string };

type ListItem = { id: string; title: string; description?: string };
type ListSection = { id: string; title: string; items: ListItem[] };
type ListData = { content?: string; menuButtonText?: string; sections?: ListSection[] };

export type BaseNodeData = {
  label: string;
  icon?: string;
  description?: string;
  color?: string;
  type?: string;
  content?: string;
  parts?: ContentPart[];
  branches?: { id: string; label: string; conditions: any[] }[];
  groups?: { type: 'and' | 'or'; conditions: { variable: string; operator: string; value: string }[] }[];
  quickReplies?: QuickReply[];
  list?: ListData;
  onOpenProperties?: (node: ReactFlowNode) => void;
  onNodeDoubleClick?: (node: ReactFlowNode, options?: { partId?: string; type?: string }) => void;
  onOpenAttachmentModal?: (nodeId: string, partId: string, type: MediaPart['type']) => void;
};


export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const { deleteNode, duplicateNode, setStartNode, startNodeId, updateNodeData, nodes } = useFlowStore();
  const { getNode } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const isOpeningModal = useRef(false);
  
  const migratedData = useMemo(() => migrateData(data), [data]);
  const parts = migratedData.parts || [];
  const textPart = useMemo(() => parts.find(p => p.type === 'text') as ContentPart & { type: 'text' } || { id: nanoid(), type: 'text', content: '' }, [parts]);
  const mediaParts = useMemo(() => parts.filter(isMediaPart), [parts]);


  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))',
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.MessageSquare : Send;

  const isMessageNode = data.type === 'messaging' && data.label === 'Send a Message';
  const isAskQuestionNode = data.label === 'Question';
  const isConditionNode = data.type === 'logic' && data.label === 'Set a Condition';
  const isButtonsNode = data.label === 'Buttons';
  const isListNode = data.label === 'List';
  const isStartNode = startNodeId === id;

  const getConditionString = (condition: { variable?: string; operator?: string; value?: string }): string => {
    if (!condition) return '';
    return `${condition.variable || ''} ${condition.operator || ''} ${condition.value || ''}`;
  };

  const hasConditions = data.groups && data.groups.some((g) => g.conditions && g.conditions.length > 0);

  const thisNode = nodes.find((n) => n.id === id);

  const handleDoubleClick = (partId?: string, type?: string) => {
    if (!thisNode) return;
    if (isMessageNode) {
      setIsEditing(true);
      return;
    }
    data.onNodeDoubleClick?.(thisNode as ReactFlowNode, { partId, type });
  };
  
  const handleClick = () => {
    if(isMessageNode) setIsEditing(true);
  }

  useClickAway(nodeRef, (event) => {
    const target = event.target as HTMLElement;
    // Check if the click was on the delete button or its children
    if (target.closest(`.${styles.deletePartButton}`)) {
      return;
    }
    if (target.closest('[role="dialog"]') || target.closest('[data-radix-popper-content-wrapper]') || isOpeningModal.current) {
        return;
    }
    if (isMessageNode && isEditing) {
      setIsEditing(false);
    }
  });


  const updateButtonLabel = (buttonId: string, newLabel: string) => {
    const newReplies = (data.quickReplies || []).map((qr) => (qr.id === buttonId ? { ...qr, label: newLabel } : qr));
    updateNodeData(id, { quickReplies: newReplies });
  };

  const handleContentChange = (content: string) => {
    const otherParts = parts.filter(p => p.type !== 'text');
    const newParts = [{ ...textPart, content }, ...otherParts];
    updateNodeData(id, { parts: newParts });
  };

  const handleDeleteAttachment = useCallback((partIdToDelete: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();
      const newParts = parts.filter(p => p.id !== partIdToDelete);
      updateNodeData(id, { parts: newParts });
  }, [id, parts, updateNodeData]);

  const handleAddMedia = (type: MediaPart['type']) => {
    isOpeningModal.current = true;
    data.onOpenAttachmentModal?.(id, nanoid(), type);
    setTimeout(() => { isOpeningModal.current = false; }, 100);
  };

  const handleOpenAttachment = (partId: string, type: ContentPart['type']) => {
    if (isMediaPart({ id: partId, type } as ContentPart)) {
      isOpeningModal.current = true;
      data.onOpenAttachmentModal?.(id, partId, type as MediaPart['type']);
      setTimeout(() => { isOpeningModal.current = false; }, 100);
    }
  };

  const AttachmentList = () => {
    const visibleParts = mediaParts.slice(0, 4);
    const hasMore = mediaParts.length > 4;
    const remainingCount = mediaParts.length - 3;
  
    return (
      <div className={cn(styles.mediaGrid)}>
        {visibleParts.map((part, index) => {
          if (hasMore && index === 3) {
            return (
              <div key="more" className={styles.attachmentTile} onClick={() => handleOpenAttachment(part.id, part.type)}>
                {part.type === 'image' && part.url ? (
                  <Image src={part.url} alt={part.name || 'Attachment'} fill className={styles.attachmentTileImage} />
                ) : (
                  <div className={styles.attachmentTileIcon}>{getFileIcon(part.name)}</div>
                )}
                <div className={styles.mediaGridMore}>+{remainingCount}</div>
              </div>
            );
          }
  
          return (
            <div key={part.id} className={styles.attachmentTile} onClick={() => handleOpenAttachment(part.id, part.type)}>
              {part.type === 'image' && part.url ? (
                <Image src={part.url} alt={part.name || 'Attachment'} fill className={styles.attachmentTileImage} />
              ) : (
                <div className={styles.attachmentTileIcon}>{getFileIcon(part.name)}</div>
              )}
               <div className={styles.attachmentTileLabel}>{part.name}</div>
              <button onClick={(e) => handleDeleteAttachment(part.id, e)} className={styles.deletePartButton} aria-label={`Remove attachment`}>
                <XCircle size={18} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const messageBody = (
    <div className={styles.messageNodeBody} onClick={handleClick}>
       {isEditing ? (
         <>
           <RichTextEditor
             value={textPart.content}
             onChange={handleContentChange}
             variables={['name', 'email', 'order_id']}
             onAddMedia={handleAddMedia}
           />
         </>
       ) : (
         <div
           className="prose dark:prose-invert prose-sm sm:prose-base w-full max-w-full px-3 py-2"
           dangerouslySetInnerHTML={{ __html: textPart.content || '<p class="text-muted-foreground">Click to edit message...</p>' }}
         />
       )}
       {mediaParts.length > 0 && (
        <div className="p-2">
            <AttachmentList />
        </div>
       )}
    </div>
  );

  const buttonsBody = (
    <div className={styles.buttonsNodeBody} onDoubleClick={() => handleDoubleClick()}>
      <div className={styles.buttonsQuestion} onClick={() => handleDoubleClick()}>
        {data.content || 'Ask a question here'}
      </div>
      <div className={styles.buttonsList}>
        {(data.quickReplies || []).map((branch: QuickReply, index: number) => (
          <div key={branch.id} className={styles.buttonItem}>
            <span>{branch.label || `Button ${index + 1}`}</span>
            <Handle type="source" position={Position.Right} id={branch.id} className={styles.buttonHandle} />
          </div>
        ))}
      </div>
    </div>
  );

  const listBody = (
    <div className={listNodeStyles.body} onDoubleClick={() => handleDoubleClick()}>
      <div className={listNodeStyles.bodyInput}>
        {data.list?.content || 'default body'}
      </div>
      <div className={`${listNodeStyles.sections} nodrag`}>
        {(data.list?.sections || []).map((section) => (
          <div key={section.id} className={listNodeStyles.section}>
            <div className={listNodeStyles.sectionItems}>
              {(section.items || []).map((item) => (
                <div key={item.id} className={listNodeStyles.item}>
                  <span>{item.title}</span>
                  <Handle type="source" position={Position.Right} id={item.id} className={listNodeStyles.handle} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={listNodeStyles.buttons}>
        <div className={listNodeStyles.listButton}>
          {data.list?.menuButtonText || 'Menu'}
          <Handle type="source" position={Position.Right} id="list-button-default" className={listNodeStyles.handle} />
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={nodeRef}
      className={cn(styles.baseNode, isMessageNode && styles.messageNode)}
      style={customStyle}
      aria-selected={selected}
    >
      <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader} onDoubleClick={() => handleDoubleClick()}>
        <div className={styles.headerLeft}>
          <Icon className={styles.nodeIcon} aria-hidden="true" size={16} />
          <span className={styles.nodeTitle} title={data.label}>
            {data.label}
          </span>
          {isStartNode && <Badge variant="secondary" className="ml-2">Start</Badge>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.nodeMore}>
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {thisNode && data.onOpenProperties && (
              <DropdownMenuItem onClick={() => data.onOpenProperties?.(thisNode as ReactFlowNode)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Properties</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {isStartNode ? (
              <DropdownMenuItem onClick={() => setStartNode(null)}>
                <XCircle className="mr-2 h-4 w-4" />
                <span>Reset start node</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setStartNode(id)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                <span>Set as start node</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => duplicateNode(id)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteNode(id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={styles.nodeBody}>
        {isMessageNode ? (
          messageBody
        ) : isAskQuestionNode ? (
          <p onDoubleClick={() => handleDoubleClick()}>{data.content || ''}</p>
        ) : isConditionNode ? (
          <div className={styles.conditionBody} onDoubleClick={() => handleDoubleClick()}>
            {hasConditions ? (
              <>
                {data.groups?.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {groupIndex > 0 && <div className={styles.orDivider}>OR</div>}
                    <div className={styles.conditionGroup}>
                      {group.conditions.map((cond, condIndex) => (
                        <div key={condIndex} className={styles.branchRow}>
                          <code className={styles.branchCondition} title={getConditionString(cond)}>
                            {getConditionString(cond)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </>
            ) : (
              <p>{data.description || 'Double-click to set conditions.'}</p>
            )}
          </div>
        ) : isButtonsNode ? (
          buttonsBody
        ) : isListNode ? (
          listBody
        ) : (
          <p onDoubleClick={() => handleDoubleClick()}>{data.description || 'Double-click to configure.'}</p>
        )}
      </div>

      <Handle type="target" position={Position.Left} className={styles.handle} />

      {isConditionNode ? (
        <>
          {data.branches && data.branches.length > 0 ? (
            data.branches.map((branch, index) => (
              <React.Fragment key={branch.id}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={branch.id}
                  className={styles.handle}
                  style={{ top: `${(index + 1) * (100 / (data.branches!.length + 1))}%` }}
                />
                <div className={styles.handleLabel} style={{ top: `${(index + 1) * (100 / (data.branches!.length + 1))}%` }}>
                  {branch.label}
                </div>
              </React.Fragment>
            ))
          ) : (
            <>
              <Handle type="source" position={Position.Right} id="true" className={styles.handle} style={{ top: '33.3%' }} />
              <div className={styles.handleLabel} style={{ top: '33.3%' }}>True</div>
              <Handle type="source" position={Position.Right} id="false" className={styles.handle} style={{ top: '66.6%' }} />
              <div className={styles.handleLabel} style={{ top: '66.6%' }}>False</div>
            </>
          )}
        </>
      ) : isAskQuestionNode ? (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      ) : isButtonsNode ? (
        null
      ) : isListNode ? (
        null
      ) : isMessageNode ? (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  );
}
