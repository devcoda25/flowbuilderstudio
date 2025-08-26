
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { type FullFlow } from './flow';

const LOCAL_STORAGE_KEY = 'omni_flows';

type FlowsState = {
  flows: FullFlow[];
  activeFlowId: string | null;
  activeFlow: FullFlow | null;
  loadFlows: () => void;
  saveFlow: (flowData: Omit<FullFlow, 'id' | 'lastModified'> & { id?: string }) => void;
  setActiveFlow: (flowId: string | null) => void;
  createNewFlow: () => void;
  deleteFlow: (flowId: string) => void;
};

function getStoredFlows(): FullFlow[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];
  try {
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function setStoredFlows(flows: FullFlow[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flows));
}

const getDefaultFlow = (): FullFlow => ({
    id: nanoid(),
    title: 'Untitled Flow',
    channels: ['whatsapp'],
    waMessageContext: 'template',
    lastModified: Date.now(),
    nodes: [],
    edges: [],
});

export const useFlowsStore = create<FlowsState>((set, get) => ({
  flows: [],
  activeFlowId: null,
  activeFlow: null,

  loadFlows: () => {
    const storedFlows = getStoredFlows();
    if (storedFlows.length > 0) {
      const sorted = storedFlows.sort((a, b) => b.lastModified - a.lastModified);
      set({ flows: sorted });
      get().setActiveFlow(sorted[0].id);
    } else {
      // No flows, create a default one
      const newFlow = getDefaultFlow();
      set({ flows: [newFlow], activeFlow: newFlow, activeFlowId: newFlow.id });
      setStoredFlows([newFlow]);
    }
  },

  saveFlow: (flowData) => {
    const flows = get().flows;
    const flowId = flowData.id || get().activeFlowId;
    if (!flowId) return;

    const existingIndex = flows.findIndex(f => f.id === flowId);
    const updatedFlow = { ...flows[existingIndex], ...flowData, id: flowId, lastModified: Date.now() };

    let newFlows: FullFlow[];
    if (existingIndex > -1) {
      newFlows = flows.map((f, i) => (i === existingIndex ? updatedFlow : f));
    } else {
      newFlows = [...flows, updatedFlow];
    }
    set({ flows: newFlows, activeFlow: updatedFlow, activeFlowId: updatedFlow.id });
    setStoredFlows(newFlows);
  },

  setActiveFlow: (flowId) => {
    const flow = get().flows.find(f => f.id === flowId);
    if (flow) {
      set({ activeFlow: flow, activeFlowId: flow.id });
    }
  },

  createNewFlow: () => {
    const newFlow = getDefaultFlow();
    const newFlows = [...get().flows, newFlow];
    set({ flows: newFlows });
    setStoredFlows(newFlows);
    get().setActiveFlow(newFlow.id);
  },

  deleteFlow: (flowId) => {
    let newFlows = get().flows.filter(f => f.id !== flowId);
    
    if (get().activeFlowId === flowId) {
        if (newFlows.length > 0) {
            const nextActiveFlow = newFlows.sort((a,b) => b.lastModified - a.lastModified)[0];
            get().setActiveFlow(nextActiveFlow.id);
        } else {
            const newFlow = getDefaultFlow();
            newFlows = [newFlow];
            get().setActiveFlow(newFlow.id);
        }
    }

    set({ flows: newFlows });
    setStoredFlows(newFlows);
  },
}));

// Initialize the store
if (typeof window !== 'undefined') {
    useFlowsStore.getState().loadFlows();
}
