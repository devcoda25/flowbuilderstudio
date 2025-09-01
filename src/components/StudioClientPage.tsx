
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Node } from 'reactflow';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { nanoid } from 'nanoid';

import HeaderBar from '@/components/HeaderBar';
import SidebarPalette, { PaletteItemPayload } from '@/components/SidebarPalette';
import CanvasWithLayoutWorker from '@/components/CanvasWithLayoutWorker/CanvasWithLayoutWorker';
import PropertiesPanel from '@/components/PropertiesPanel';
import { useFlowStore, useFlowMetaStore, undo, redo } from '@/store/flow';
import { useFlowsStore } from '@/store/flows';
import TestConsole from '@/components/TestConsole';
import { useUIStore } from '@/store/ui';
import PublishBanner from '@/components/Presence/PublishBanner';
import { FlowEngine } from '@/engine/FlowEngine';
import { useHistoryStore } from '@/store/history';
import { getRandomColor } from '@/lib/color-utils';

import ImageAttachmentModal from '@/components/PropertiesPanel/partials/ImageAttachmentModal';
import VideoAttachmentModal from '@/components/PropertiesPanel/partials/VideoAttachmentModal';
import DocumentAttachmentModal from '@/components/PropertiesPanel/partials/DocumentAttachmentModal';
import AudioAttachmentModal from '@/components/PropertiesPanel/partials/AudioAttachmentModal';
import WebhookModal from '@/components/PropertiesPanel/partials/WebhookModal';
import ConditionModal from '@/components/PropertiesPanel/partials/ConditionModal';
import GoogleSheetsModal from '@/components/PropertiesPanel/partials/GoogleSheetsModal';
import AssignUserModal from '@/components/PropertiesPanel/partials/AssignUserModal';
import AssignTeamModal from '@/components/PropertiesPanel/partials/AssignTeamModal';
import FlowsModal from '@/components/FlowsModal/FlowsModal';
import ListModal from '@/components/PropertiesPanel/partials/ListModal';
import ButtonsModal from '@/components/PropertiesPanel/partials/ButtonsModal';
import QuestionModal from '@/components/PropertiesPanel/partials/QuestionModal';

import type { ContentPart } from '@/components/CanvasWithLayoutWorker/nodes/BaseNode';
import { MediaPart } from '@/types/MediaPart';
import { useToast } from '@/hooks/use-toast';

type ModalState = {
  type: 'image' | 'video' | 'document' | 'audio' | 'webhook' | 'condition' | 'googleSheets' | 'assignUser' | 'assignTeam' | 'flows' | 'list' | 'buttons' | 'question';
  nodeId?: string;
  data?: any;
  partId?: string;
} | null;

const isMediaPart = (
  part: ContentPart | undefined
): part is ContentPart & { type: 'image' | 'video' | 'audio' | 'document'; url?: string; name?: string } => {
  return !!part && ['image', 'video', 'audio', 'document'].includes(part.type);
};

function StudioPageContent() {
  const { nodes, edges, addNode, setNodes, onNodesChange, onEdgesChange, onConnect, updateNodeData, onConnectStart, onConnectEnd, setEdges } = useFlowStore();
  const { meta, setTitle, setChannels, setWaContext, setMeta } = useFlowMetaStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const { saveFlow, createNewFlow, deleteFlow, activeFlow } = useFlowsStore();
  const { toast } = useToast();

  const { isTestConsoleOpen, toggleTestConsole } = useUIStore();
  const { canUndo, canRedo } = useHistoryStore();

  const engine = useMemo(() => new FlowEngine({ channel: meta.channels[0], clock: 'real' }), [meta.channels]);
  const { project } = useReactFlow();

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  useEffect(() => {
    if (activeFlow) {
      const { nodes, edges, ...meta } = activeFlow;
      setNodes(nodes);
      setEdges(edges);
      setMeta(meta);
    }
  }, [activeFlow?.id, setNodes, setEdges, setMeta, activeFlow]);

  engine.setFlow(nodes, edges);

  const handleNodeDoubleClick = useCallback((node: Node) => {
    const nodeLabel = node.data?.label;

    if (nodeLabel === 'Send a Message') return;

    if (nodeLabel === 'Question') {
      setModalState({ type: 'question', nodeId: node.id });
      return;
    }

    if (nodeLabel === 'Buttons') {
      setModalState({ type: 'buttons', nodeId: node.id });
      return;
    }

    if (nodeLabel === 'List') {
      setModalState({ type: 'list', nodeId: node.id });
      return;
    }

    if (nodeLabel === 'Webhook') {
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
    const part = (node.data.parts || []).find((p: ContentPart) => p.id === partId);
    setModalState({ type, nodeId, partId, data: part });
  }, [nodes]);

  const openPropertiesForNode = useCallback((node: Node | null) => {
    setSelectedNodeId(node?.id || null);
  }, []);

  const handleSaveNode = (nodeId: string, data: Record<string, any>) => {
    updateNodeData(nodeId, data);
  };

  const onSaveModal = (data: any) => {
    if (!modalState || !modalState.nodeId) return;
    updateNodeData(modalState.nodeId, data);
    setModalState(null);
  };

  const onSaveMedia = (newMedia: MediaPart | MediaPart[]) => {
    if (!modalState || !modalState.nodeId || !modalState.partId) return;

    const node = nodes.find(n => n.id === modalState.nodeId);
    if (!node) return;

    const newMediaArray = Array.isArray(newMedia) ? newMedia : [newMedia];

    const existingPartIndex = (node.data.parts || []).findIndex((p: ContentPart) => p.id === modalState.partId);

    let newParts: ContentPart[];

    if (existingPartIndex > -1) {
      newParts = [...(node.data.parts || [])];
      newParts[existingPartIndex] = {
        id: newParts[existingPartIndex].id,
        type: newMediaArray[0].type,
        url: newMediaArray[0].url,
        name: newMediaArray[0].name,
      };

      if (newMediaArray.length > 1) {
        const additionalParts = newMediaArray.slice(1).map(media => ({
          id: media.id,
          type: media.type,
          url: media.url,
          name: media.name,
        }));
        newParts.splice(existingPartIndex + 1, 0, ...additionalParts);
      }
    } else {
      const partsToAdd = newMediaArray.map((media, index) => {
        const id = index === 0 ? modalState.partId! : media.id;
        return { id, type: media.type, url: media.url, name: media.name };
      });
      newParts = [...(node.data.parts || []), ...partsToAdd];
    }

    updateNodeData(modalState.nodeId, { parts: newParts });
    setModalState(null);
  };

  const onDeleteMedia = () => {
    if (!modalState || !modalState.partId || !modalState.nodeId) return;
    const node = nodes.find(n => n.id === modalState.nodeId);
    if (node) {
      const newParts = (node.data.parts || []).filter((p: ContentPart) => p.id !== modalState!.partId);
      updateNodeData(modalState.nodeId, { parts: newParts });
    }
    setModalState(null);
  };

  const handleDragStart = (_e: React.DragEvent, item: PaletteItemPayload) => {};

  const handleClickAdd = (item: PaletteItemPayload) => {
    const { x, y } = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: Node = {
      id: nanoid(),
      type: 'base',
      position: { x: x - 200, y: y - 100 },
      data: {
        label: item.label,
        icon: item.icon,
        type: item.type,
        color: item.color || getRandomColor(),
        description: item.description,
        content: item.content,
        quickReplies: item.quickReplies,
        list: item.list,
      },
    };
    addNode(newNode);
  };

  const handleSaveFlow = useCallback(() => {
    saveFlow({ ...meta, nodes, edges });
    toast({
      title: 'Flow Saved',
      description: `"${meta.title}" has been saved successfully.`,
    });
  }, [meta, nodes, edges, saveFlow, toast]);

  const handleNewFlow = () => {
    createNewFlow();
    toast({
      title: 'New Flow Created',
      description: 'A new empty flow has been created.',
    });
  };

  const handleDeleteFlow = () => {
    if (window.confirm(`Are you sure you want to delete the flow "${meta.title}"? This cannot be undone.`)) {
      deleteFlow(meta.id);
      toast({
        title: 'Flow Deleted',
        description: `"${meta.title}" has been deleted.`,
        variant: 'destructive',
      });
    }
  };

  const activePart = useMemo(() => {
    if (!modalState?.nodeId || !modalState?.partId) return undefined;
    const node = nodes.find(n => n.id === modalState.nodeId);
    const part = node?.data.parts?.find((p: ContentPart) => p.id === modalState.partId);
    if (isMediaPart(part)) {
      return part as MediaPart;
    }
    return undefined;
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
          onSaveClick={handleSaveFlow}
          onNewFlow={handleNewFlow}
          onOpenFlows={() => setModalState({ type: 'flows' })}
          onDeleteFlow={handleDeleteFlow}
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

      {modalState?.type === 'question' && modalState.nodeId && (
        <QuestionModal isOpen={true} onClose={() => setModalState(null)} nodeId={modalState.nodeId} />
      )}
      {modalState?.type === 'buttons' && modalState.nodeId && (
        <ButtonsModal isOpen={true} onClose={() => setModalState(null)} nodeId={modalState.nodeId} />
      )}
      {modalState?.type === 'list' && modalState.nodeId && (
        <ListModal isOpen={true} onClose={() => setModalState(null)} nodeId={modalState.nodeId} />
      )}
      {modalState?.type === 'flows' && (
        <FlowsModal isOpen={true} onClose={() => setModalState(null)} />
      )}
      {modalState?.type === 'image' && modalState.nodeId && modalState.partId && (
        <ImageAttachmentModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveMedia}
          onDelete={onDeleteMedia}
          media={activePart}
          type={modalState.type}
        />
      )}
      {modalState?.type === 'video' && modalState.nodeId && modalState.partId && (
        <VideoAttachmentModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveMedia}
          onDelete={onDeleteMedia}
          media={activePart}
          type={modalState.type}
        />
      )}
      {modalState?.type === 'audio' && modalState.nodeId && modalState.partId && (
        <AudioAttachmentModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveMedia}
          onDelete={onDeleteMedia}
          media={activePart}
          type={modalState.type}
        />
      )}
      {modalState?.type === 'document' && modalState.nodeId && modalState.partId && (
        <DocumentAttachmentModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveMedia}
          onDelete={onDeleteMedia}
          media={activePart}
          type={modalState.type}
        />
      )}
      {modalState?.type === 'webhook' && (
        <WebhookModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
        />
      )}
      {modalState?.type === 'condition' && (
        <ConditionModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
        />
      )}
      {modalState?.type === 'googleSheets' && (
        <GoogleSheetsModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
        />
      )}
      {modalState?.type === 'assignUser' && (
        <AssignUserModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
        />
      )}
      {modalState?.type === 'assignTeam' && (
        <AssignTeamModal
          isOpen={true}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
        />
      )}

      <TestConsole isOpen={isTestConsoleOpen} onClose={toggleTestConsole} engine={engine} flowId={meta.id} />
    </div>
  );
}

export default function StudioClientPage() {
  return (
    <ReactFlowProvider>
      <StudioPageContent />
    </ReactFlowProvider>
  );
}
