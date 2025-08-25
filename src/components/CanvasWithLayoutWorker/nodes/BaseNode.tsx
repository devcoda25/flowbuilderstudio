import React, { useCallback, useEffect, useRef } from 'react';
import { Handle, Position, Node, useReactFlow } from 'reactflow';
import styles from '../canvas-layout.module.css';
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2, Copy, PlayCircle, XCircle, Settings, Image, Video, AudioLines, FileText, MessageSquare as MessageSquareIcon, File as FileIcon, Film, Image as ImageIcon, Plus, Paperclip } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import RichTextEditor from '@/components/PropertiesPanel/partials/RichTextEditor';
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
import { Input } from '@/components/ui/input';

export type ContentPart =
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'image'; url?: string; name?: string }
  | { id: string; type: 'video'; url?: string; name?: string }
  | { id: string; type: 'audio'; url?: string; name?: string }
  | { id: string; type: 'document'; url?: string; name?: string };

export type QuickReply = { id: string; label: string };

export type BaseNodeData = {
  label: string;
  icon?: string;
  description?: string;
  color?: string;
  type?: string;
  content?: string;
  media?: { type: 'image' | 'video' | 'document' | 'audio'; url: string; name?: string };
  parts?: ContentPart[];
  branches?: { id: string; label: string; conditions: any[] }[];
  groups?: { type: 'and' | 'or'; conditions: { variable: string; operator: string; value: string }[] }[];
  quickReplies?: QuickReply[];
  onOpenProperties?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node, options?: { partId?: string; type?: string }) => void;
  onOpenAttachmentModal?: (nodeId: string, partId: string, type: 'image' | 'video' | 'audio' | 'document', callback: (media: any) => void) => void;
};

function migrateData(data: BaseNodeData): ContentPart[] {
  if (data.parts) return data.parts;

  const parts: ContentPart[] = [];
  if (data.content) {
    parts.push({ id: nanoid(), type: 'text', content: data.content });
  }
  if (data.media) {
    parts.push({ id: nanoid(), type: data.media.type, url: data.media.url, name: data.media.name });
  }

  if (parts.length === 0) {
    return [{ id: nanoid(), type: 'text', content: '<p></p>' }];
  }
  return parts;
}

const MEDIA_TYPES: ContentPart['type'][] = ['image', 'video', 'audio', 'document'];

function MediaGridItem({ part, onDoubleClick }: { part: ContentPart; onDoubleClick: () => void }) {
  const getIcon = () => {
    switch (part.type) {
      case 'image':
        return part.url ? (
          <img src={part.url} alt={part.name || 'Image'} className={styles.mediaGridImage} data-ai-hint="abstract background" />
        ) : (
          <ImageIcon size={24} />
        );
      case 'video':
        return <Film size={24} />;
      case 'document':
        return <FileIcon size={24} />;
      case 'audio':
        return <AudioLines size={24} />;
      default:
        return null;
    }
  };
  return (
    <button className={styles.mediaGridItem} onClick={onDoubleClick}>
      {getIcon()}
    </button>
  );
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const { deleteNode, duplicateNode, setStartNode, startNodeId, updateNodeData, nodes } = useFlowStore();
  const { getNode } = useReactFlow();

  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))',
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;

  const isMessageNode = data.type === 'messaging' && data.label === 'Send a Message';
  const isAskQuestionNode = data.label === 'Ask a Question';
  const isConditionNode = data.type === 'logic' && data.label === 'Set a Condition';
  const isButtonsNode = data.label === 'Buttons' || data.label === 'List';
  const isStartNode = startNodeId === id;

  const parts = isMessageNode ? migrateData(data) : [];
  const textParts = isMessageNode ? parts.filter((p): p is ContentPart & { type: 'text'; content: string } => p.type === 'text') : [];
  const mediaParts = isMessageNode ? parts.filter((p): p is ContentPart & { type: 'image' | 'video' | 'audio' | 'document' } => MEDIA_TYPES.includes(p.type)) : [];

  const getConditionString = (condition: { variable?: string; operator?: string; value?: string }): string => {
    if (!condition) return '';
    return `${condition.variable || ''} ${condition.operator || ''} ${condition.value || ''}`;
  };

  const hasConditions = data.groups && data.groups.some((g) => g.conditions && g.conditions.length > 0);

  const thisNode = nodes.find((n) => n.id === id);

  const handleDoubleClick = (partId?: string, type?: string) => {
    if (!thisNode) return;

    if (isMessageNode && data.onNodeDoubleClick) {
      const partType = type || parts.find((p) => p.id === partId)?.type;
      if (partType && partType !== 'text') {
        data.onNodeDoubleClick(thisNode, { partId: partId, type: partType });
      } else if (partType !== 'text') {
        data.onNodeDoubleClick(thisNode);
      }
    } else if (!isButtonsNode) {
      data.onNodeDoubleClick?.(thisNode);
    }
  };

  const updatePartContent = (partId: string, content: string) => {
    const newParts = parts.map((p) => (p.id === partId && p.type === 'text' ? { ...p, content } : p));
    updateNodeData(id, { parts: newParts });
  };

  const handleAddMedia = (type: 'image' | 'video' | 'audio' | 'document') => {
    const callback = (media: any | any[]) => {
      const mediaArray = Array.isArray(media) ? media : [media];

      let contentToInsert = '';
      mediaArray.forEach((m: any) => {
        if (m.type === 'image') {
          contentToInsert += `<img src="${m.url}" style="width: 20%" />`;
        } else {
          const typeLabel = m.type.charAt(0).toUpperCase() + m.type.slice(1);
          contentToInsert += `<p><a href="${m.url}" target="_blank">[${typeLabel}: ${m.name || 'link'}]</a></p>`;
        }
      });

      if (isMessageNode) {
        const textPart = parts.find((p): p is ContentPart & { type: 'text'; content: string } => p.type === 'text');
        if (textPart) {
          const newParts = parts.map((p) =>
            p.id === textPart.id && p.type === 'text'
              ? { ...p, content: (p.content || '<p></p>').replace(/<p><\/p>$/, '') + contentToInsert }
              : p
          );
          updateNodeData(id, { parts: newParts });
        } else {
          const newParts = [
            ...parts,
            { id: nanoid(), type: 'text', content: contentToInsert },
            ...mediaArray.map((m: any) => ({ id: nanoid(), type: m.type, url: m.url, name: m.name })),
          ];
          updateNodeData(id, { parts: newParts });
        }
      } else {
        const newParts = [
          ...parts,
          { id: nanoid(), type: 'text', content: contentToInsert },
          ...mediaArray.map((m: any) => ({ id: nanoid(), type: m.type, url: m.url, name: m.name })),
        ];
        updateNodeData(id, { parts: newParts });
      }
    };

    data.onOpenAttachmentModal?.(id, nanoid(), type, callback);
  };

  const renderedParts = (
    <>
      {textParts.map((part) => (
        <div key={part.id} className={styles.messagePart}>
          <div className="nodrag">
            <RichTextEditor
              value={part.content}
              onChange={(content) => updatePartContent(part.id, content)}
              placeholder="Type your message..."
              variables={['name', 'email', 'cart_item', 'order_id']}
              onAddMedia={handleAddMedia}
            />
          </div>
        </div>
      ))}
      {mediaParts.length > 0 && (
        <div className={styles.mediaGrid}>
          {mediaParts.map((part) => (
            <MediaGridItem
              key={part.id}
              part={part}
              onDoubleClick={() => handleDoubleClick(part.id, part.type)}
            />
          ))}
        </div>
      )}
    </>
  );

  const messageBody = <div className={styles.messageNodeBody}>{renderedParts}</div>;

  const createMarkup = (html: string) => {
    if (typeof window !== 'undefined') {
      return { __html: DOMPurify.sanitize(html) };
    }
    return { __html: html };
  };

  const updateButtonLabel = (buttonId: string, newLabel: string) => {
    const newReplies = (data.quickReplies || []).map((qr) => (qr.id === buttonId ? { ...qr, label: newLabel } : qr));
    updateNodeData(id, { quickReplies: newReplies });
  };

  const addButton = () => {
    const newReplies = [...(data.quickReplies || []), { id: nanoid(), label: 'New Button' }];
    updateNodeData(id, { quickReplies: newReplies });
  };

  const removeButton = (buttonId: string) => {
    const newReplies = (data.quickReplies || []).filter((qr) => qr.id !== buttonId);
    updateNodeData(id, { quickReplies: newReplies });
  };

  const buttonsBody = (
    <div className={styles.buttonsNodeBody}>
      <div className={`${styles.buttonEditorWrapper} nodrag`}>
        <RichTextEditor
          value={data.content || '<p></p>'}
          onChange={(content) => updateNodeData(id, { content })}
          placeholder="Type your message..."
          variables={['name', 'email', 'cart_item', 'order_id']}
          onAddMedia={handleAddMedia}
        />
      </div>
      <div className={styles.buttonsList}>
        {(data.quickReplies || []).map((branch: QuickReply, index: number) => (
          <div key={branch.id} className={styles.buttonItem}>
            <Input
              value={branch.label}
              onChange={(e) => updateButtonLabel(branch.id, e.target.value)}
              placeholder={`Button ${index + 1}`}
              className="h-8 nodrag"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeButton(branch.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Handle type="source" position={Position.Right} id={branch.id} className={styles.buttonHandle} />
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-2" onClick={addButton}>
        <Plus size={16} className="mr-2" /> Add button
      </Button>
    </div>
  );

  return (
    <div className={styles.baseNode} style={customStyle} aria-selected={selected}>
      <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.nodeIconWrapper}>
            <Icon className={styles.nodeIcon} aria-hidden="true" />
          </span>
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
              <DropdownMenuItem onClick={() => data.onOpenProperties?.(thisNode)}>
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
          <div className="nodrag">
            <RichTextEditor
              value={data.content || '<p></p>'}
              onChange={(content) => updateNodeData(id, { content })}
              placeholder="Type your question..."
              variables={['name', 'email', 'cart_item', 'order_id']}
              onAddMedia={handleAddMedia}
            />
          </div>
        ) : isConditionNode ? (
          <div className={styles.conditionBody} onClick={() => handleDoubleClick()}>
            {hasConditions ? (
              data.groups?.map((group, groupIndex) => (
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
              ))
            ) : (
              <p>{data.description || 'Double-click to set conditions.'}</p>
            )}
          </div>
        ) : isButtonsNode ? (
          buttonsBody
        ) : (
          <p onClick={() => handleDoubleClick()}>{data.description || 'Double-click to configure.'}</p>
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
        <Handle type="source" position={Position.Right} className={styles.handle} style={{ top: '50%' }} />
      ) : isButtonsNode ? (
        null
      ) : isMessageNode ? (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  );
}