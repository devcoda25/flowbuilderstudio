
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Handle, Position, Node, useReactFlow } from 'reactflow';
import styles from '../canvas-layout.module.css';
import listNodeStyles from './list-node.module.css';
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2, Copy, PlayCircle, XCircle, Settings, Image, Video, AudioLines, FileText, MessageSquare as MessageSquareIcon, File as FileIcon, Film, Image as ImageIcon, Plus, Paperclip, Music, FileQuestion, FileSpreadsheet, FileJson } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
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

type ListItem = { id: string; title: string; description?: string };
type ListSection = { id: string; title: string; items: ListItem[] };
type ListData = { menuButtonText: string; sections: ListSection[] };

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
  list?: ListData;
  onOpenProperties?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node, options?: { partId?: string; type?: string }) => void;
  onOpenAttachmentModal?: (nodeId: string, partId: string, type: 'image' | 'video' | 'audio' | 'document') => void;
};

const MEDIA_TYPES: ContentPart['type'][] = ['image', 'video', 'audio', 'document'];

// Ensure old `content` field is migrated to new `parts` structure
const migrateData = (data: BaseNodeData): BaseNodeData => {
    if (typeof data.content === 'string' && !data.parts) {
        return { ...data, parts: [{ id: nanoid(), type: 'text', content: data.content }] };
    }
    if (!data.parts) {
        return { ...data, parts: [{ id: nanoid(), type: 'text', content: '' }] };
    }
    return data;
}

const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileIcon className="w-8 h-8 text-muted-foreground" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
        case 'docx': return <FileText className="w-8 h-8 text-blue-500" />;
        case 'mp3':
        case 'wav': return <Music className="w-8 h-8 text-orange-500" />;
        case 'mp4':
        case 'mov': return <Film className="w-8 h-8 text-purple-500" />;
        case 'txt': return <FileText className="w-8 h-8 text-gray-500" />;
        case 'csv':
        case 'xlsx': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
        case 'json': return <FileJson className="w-8 h-8 text-yellow-500" />;
        default: return <FileQuestion className="w-8 h-8 text-muted-foreground" />;
    }
}


export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const { deleteNode, duplicateNode, setStartNode, startNodeId, updateNodeData, nodes } = useFlowStore();
  const { getNode } = useReactFlow();

  const migratedData = useMemo(() => migrateData(data), [data]);

  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))',
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;

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
    data.onNodeDoubleClick?.(thisNode);
  };

  const updateButtonLabel = (buttonId: string, newLabel: string) => {
    const newReplies = (data.quickReplies || []).map((qr) => (qr.id === buttonId ? { ...qr, label: newLabel } : qr));
    updateNodeData(id, { quickReplies: newReplies });
  };
    
  const buttonsBody = (
    <div className={styles.buttonsNodeBody} onDoubleClick={() => handleDoubleClick()}>
      <div className={styles.buttonsQuestion} onClick={() => handleDoubleClick()}>
        {data.content || 'Ask a question here'}
      </div>
      <div className={styles.buttonsList}>
        {(data.quickReplies || []).map((branch: QuickReply, index: number) => (
          <div key={branch.id} className={styles.buttonItem}>
            <Input
              value={branch.label}
              onChange={(e) => updateButtonLabel(branch.id, e.target.value)}
              placeholder={`Button ${index + 1}`}
              className={styles.buttonInput}
            />
            <Handle type="source" position={Position.Right} id={branch.id} className={styles.buttonHandle} />
          </div>
        ))}
      </div>
    </div>
  );
  
  const listBody = (
    <div className={listNodeStyles.body} onDoubleClick={() => handleDoubleClick()}>
        <div className={listNodeStyles.bodyInput}>
          {data.content || 'default body'}
        </div>
        <div className={`${listNodeStyles.sections} nodrag`}>
            {(data.list?.sections || []).map((section, sectionIndex) => (
                <div key={section.id} className={listNodeStyles.section}>
                    <div className={listNodeStyles.sectionItems}>
                        {(section.items || []).map((item, itemIndex) => (
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
            <Button variant="outline" size="sm" className={listNodeStyles.listButton}>Default</Button>
            <Button variant="outline" size="sm" className={listNodeStyles.listButton}>New Button</Button>
        </div>
    </div>
  );

  return (
    <div className={styles.baseNode} style={customStyle} aria-selected={selected} onDoubleClick={() => handleDoubleClick()}>
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
            <p>{data.description || 'Double-click to configure.'}</p>
        ) : isAskQuestionNode ? (
          <p>{data.description || 'Ask a question here'}</p>
        ) : isConditionNode ? (
          <div className={styles.conditionBody}>
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
        ) : isListNode ? (
          listBody
        ) : (
          <p>{data.description || 'Double-click to configure.'}</p>
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
        null // Handles are now part of the listBody rendering
      ) : isMessageNode ? (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  );
}
