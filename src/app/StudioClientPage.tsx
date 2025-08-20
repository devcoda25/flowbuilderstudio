
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Node } from 'reactflow';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { nanoid } from 'nanoid';

import HeaderBar from '@/components/HeaderBar';
import SidebarPalette, { PaletteItemPayload } from '@/components/SidebarPalette';
import CanvasWithLayoutWorker from '@/components/CanvasWithLayoutWorker/CanvasWithLayoutWorker';
import PropertiesPanel from '@/components/PropertiesPanel';
import { useFlowStore, useFlowMetaStore, undo, redo } from '@/store/flow';
import TestConsole from '@/components/TestConsole';
import { useUIStore } from '@/store/ui';
import PublishBanner from '@/components/Presence/PublishBanner';
import { FlowEngine } from '@/engine/FlowEngine';
import { useHistoryStore } from '@/store/history';
import { getRandomColor } from '@/lib/color-utils';

import MessageContentModal from '@/components/PropertiesPanel/partials/MessageContentModal';
import ImageAttachmentModal from '@/components/PropertiesPanel/partials/ImageAttachmentModal';
import VideoAttachmentModal from '@/components/PropertiesPanel/partials/VideoAttachmentModal';
import DocumentAttachmentModal from '@/components/PropertiesPanel/partials/DocumentAttachmentModal';
import AudioAttachmentModal from '@/components/PropertiesPanel/partials/AudioAttachmentModal';
import WebhookModal from '@/components/PropertiesPanel/partials/WebhookModal';
import ConditionModal from '@/components/PropertiesPanel/partials/ConditionModal';
import GoogleSheetsModal from '@/components/PropertiesPanel/partials/GoogleSheetsModal';
import AssignUserModal from '@/components/PropertiesPanel/partials/AssignUserModal';
import AssignTeamModal from '@/components/PropertiesPanel/partials/AssignTeamModal';
import ButtonsModal from '@/components/PropertiesPanel/partials/ButtonsModal';
import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';

type ModalState = {
  type: 'image' | 'video' | 'document' | 'audio' | 'webhook' | 'condition' | 'googleSheets' | 'assignUser' | 'assignTeam' | 'buttons';
  nodeId: string;
  data?: any;
  partId?: string;
} | null;

type MediaPart = { url: string; name?: string; type: 'image' | 'video' | 'audio' | 'document' };

function StudioPageContent() {
  const { nodes, edges, addNode, setNodes, onNodesChange, onEdgesChange, onConnect, updateNodeData, onConnectStart, onConnectEnd } = useFlowStore();
  const { meta, setTitle, setChannels, setPublished, setWaContext } = useFlowMetaStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const { isTestConsoleOpen, toggleTestConsole } = useUIStore();
  const { canUndo, canRedo } = useHistoryStore();

  const engine = useMemo(() => new FlowEngine({ channel: meta.channels[0], clock: 'real' }), [meta.channels]);
  const { project } = useReactFlow();
  
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);


  engine.setFlow(nodes, edges);

  const handleNodeDoubleClick = useCallback((node: Node, options?: { partId?: string, type?: string }) => {
    const nodeType = node.data?.type;
    const nodeLabel = node.data?.label;

    if (nodeLabel === 'Send a Message' && options?.partId) {
        switch(options.type) {
            case 'text':
                // Inline editing, no modal needed
                return;
            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                 setModalState({ type: options.type, nodeId: node.id, partId: options.partId, data: node.data });
                 return;
        }
    }

    if (nodeType === 'messaging' || nodeLabel === 'Ask a Question') {
        // Old logic for message modal, no longer used for Send a Message text parts
    } else if (nodeLabel === 'Buttons' || nodeLabel === 'List') {
        setModalState({ type: 'buttons', nodeId: node.id, data: { content: node.data.content, quickReplies: node.data.quickReplies } });
    } else if (nodeLabel === 'Webhook') {
        setModalState({ type: 'webhook', nodeId: node.id, data: node.data });
    } else if (nodeLabel === 'Set a Condition') {
        setModalState({ type: 'condition', nodeId: node.id, data: { groups: node.data.groups } });
    } else if (nodeLabel === 'Google Sheets') {
        setModalState({ type: 'googleSheets', nodeId: node.id, data: node.data });
    } else if (nodeLabel === 'Assign to User') {
        setModalState({ type: 'assignUser', nodeId: node.id, data: node.data });
    } else if (nodeLabel === 'Assign to Team') {
        setModalState({ type: 'assignTeam', nodeId: node.id, data: node.data });
    }
  }, []);

  const openAttachmentModal = useCallback((nodeId: string, partId: string, type: 'image' | 'video' | 'audio' | 'document') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setModalState({ type, nodeId, partId, data: { parts: node.data.parts } });
  }, [nodes]);
  
  const openPropertiesForNode = useCallback((node: Node | null) => {
    setSelectedNodeId(node?.id || null);
  }, []);

  const handleSaveNode = (nodeId: string, data: Record<string, any>) => {
    updateNodeData(nodeId, data);
  };
  
  const onSaveModal = (data: any) => {
    if (!modalState) return;
    updateNodeData(modalState.nodeId, data);
    setModalState(null);
  };
  
  const onSaveMedia = (newMedia: MediaPart | MediaPart[]) => {
    if (!modalState || !modalState.partId) return;
    const node = nodes.find(n => n.id === modalState.nodeId);
    if (node) {
        const newMediaArray = Array.isArray(newMedia) ? newMedia : [newMedia];
        
        let parts = [...(node.data.parts || [])];
        const partIndex = parts.findIndex(p => p.id === modalState.partId);

        if (partIndex !== -1) {
            // Replace the placeholder part with the first new media item
            parts[partIndex] = { ...parts[partIndex], ...newMediaArray[0] };

            // Add any additional media items after the first one
            if (newMediaArray.length > 1) {
                const additionalParts = newMediaArray.slice(1).map(media => ({
                    id: nanoid(),
                    ...media,
                }));
                parts.splice(partIndex + 1, 0, ...additionalParts);
            }
        }
        updateNodeData(modalState.nodeId, { parts });
    }
    setModalState(null);
  }
  
  const onDeleteMedia = () => {
    if (!modalState || !modalState.partId) return;
    const node = nodes.find(n => n.id === modalState.nodeId);
    if (node) {
        const newParts = (node.data.parts || []).filter((p: ContentPart) => p.id !== modalState!.partId);
        updateNodeData(modalState.nodeId, { parts: newParts });
    }
    setModalState(null);
  }

  const handleDragStart = (_e: React.DragEvent, item: PaletteItemPayload) => {
    // This is handled by ReactFlow's onDrop, but you could add logic here
  };

  const handleClickAdd = (item: PaletteItemPayload) => {
    const { x, y } = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: Node = {
      id: nanoid(),
      type: 'base',
      position: { x: x - 200, y: y - 100 }, // Center it
      data: { 
        label: item.label, 
        icon: item.icon,
        color: item.color || getRandomColor(),
        description: item.description,
        type: item.type,
      },
    };
    addNode(newNode);
  };
  
  const activePart = useMemo(() => {
    if (!modalState?.nodeId || !modalState?.partId) return undefined;
    const node = nodes.find(n => n.id === modalState.nodeId);
    return node?.data.parts?.find((p: ContentPart) => p.id === modalState.partId);
  }, [modalState, nodes]);

  return (
    <div className="h-screen w-screen grid grid-rows-[56px_1fr] md:grid-cols-[280px_1fr] bg-background text-foreground relative overflow-hidden">
      <PublishBanner />
      <div className="col-span-full row-start-1 z-20">
        <HeaderBar
            title={meta.title}
            onSave={setTitle}
            channels={meta.channels}
            onChannelsChange={setChannels}
            waContext={meta.waMessageContext}
            onWaContextChange={setWaContext}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onTest={toggleTestConsole}
            onSaveClick={() => console.log('Save clicked!', { meta, nodes, edges })}
        />
      </div>
      <aside className="hidden md:block col-start-1 row-start-2 overflow-y-auto border-r border-border z-10 bg-background">
        <div className="p-4 sidebar-scroll">
            <SidebarPalette onDragStart={handleDragStart} onItemClick={handleClickAdd} filterChannels={meta.channels} />
        </div>
      </aside>
      <main className="md:col-start-2 row-start-2 col-start-1 relative overflow-hidden bg-zinc-50">
        <CanvasWithLayoutWorker
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          setNodes={setNodes}
          onNodeDoubleClick={handleNodeDoubleClick}
          onOpenProperties={openPropertiesForNode}
          onOpenAttachmentModal={openAttachmentModal}
          viewportKey="flow-editor-viewport"
        />
      </main>
      
      {selectedNodeId && (
        <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onSave={handleSaveNode}
            waContext={meta.waMessageContext}
            channels={meta.channels}
        />
      )}
      
      {/* Modals for node functions */}
      <ButtonsModal
        isOpen={modalState?.type === 'buttons'}
        onClose={() => setModalState(null)}
        onSave={onSaveModal}
        initialData={modalState?.data}
      />
      <ImageAttachmentModal
        isOpen={modalState?.type === 'image'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={activePart}
      />
      <VideoAttachmentModal
        isOpen={modalState?.type === 'video'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={activePart}
      />
      <AudioAttachmentModal
        isOpen={modalState?.type === 'audio'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={activePart}
      />
      <DocumentAttachmentModal
        isOpen={modalState?.type === 'document'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={activePart}
      />
      <WebhookModal
          isOpen={modalState?.type === 'webhook'}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
      />
      <ConditionModal
        isOpen={modalState?.type === 'condition'}
        onClose={() => setModalState(null)}
        onSave={onSaveModal}
        initialData={modalState?.data}
      />
      <GoogleSheetsModal
          isOpen={modalState?.type === 'googleSheets'}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
      />
      <AssignUserModal
        isOpen={modalState?.type === 'assignUser'}
        onClose={() => setModalState(null)}
        onSave={onSaveModal}
        initialData={modalState?.data}
      />
      <AssignTeamModal
        isOpen={modalState?.type === 'assignTeam'}
        onClose={() => setModalState(null)}
        onSave={onSaveModal}
        initialData={modalState?.data}
      />


      <TestConsole isOpen={isTestConsoleOpen} onClose={toggleTestConsole} engine={engine} flowId={meta.id} />
    </div>
  );
}


export default function StudioClientPage() {
    return (
        <ReactFlowProvider>
            <StudioPageContent />
        </ReactFlowProvider>
    )
}
