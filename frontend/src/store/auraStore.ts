import { create } from 'zustand';
import { auraService } from '../api/aura.service';

export interface ChatMessage {
    id: string;
    role: 'user' | 'aura';
    content: string;
    timestamp: Date;
}

interface AuraState {
    isOpen: boolean;
    messagesByProject: Record<string, ChatMessage[]>;
    insights: string[];
    isLoading: boolean;
    error: string | null;
    
    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    addMessage: (projectId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    sendMessage: (content: string, projectId: string) => Promise<void>;
    fetchInsights: (projectId: string) => Promise<void>;
    clearMessages: (projectId: string) => void;
    getMessages: (projectId: string) => ChatMessage[];
}

const WELCOME_MESSAGE = (name: string = ""): ChatMessage => ({
    id: 'welcome',
    role: 'aura',
    content: `Bonjour ! Je suis Aura, votre assistant IA. Comment puis-je vous aider sur le projet ${name} ?`,
    timestamp: new Date()
});

export const useAuraStore = create<AuraState>()((set, get) => ({
    isOpen: false,
    messagesByProject: {},
    insights: [],
    isLoading: false,
    error: null,

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
    
    getMessages: (projectId) => {
        const history = get().messagesByProject[projectId];
        if (!history) {
            return [WELCOME_MESSAGE()];
        }
        return history;
    },

    addMessage: (projectId, msg) => set((state) => {
        const currentHistory = state.messagesByProject[projectId] || [WELCOME_MESSAGE()];
        return {
            messagesByProject: {
                ...state.messagesByProject,
                [projectId]: [...currentHistory, { ...msg, id: Math.random().toString(36).substring(7), timestamp: new Date() }]
            }
        };
    }),

    clearMessages: (projectId) => set((state) => ({
        messagesByProject: {
            ...state.messagesByProject,
            [projectId]: [WELCOME_MESSAGE()]
        }
    })),

    sendMessage: async (content: string, projectId: string) => {
        get().addMessage(projectId, { role: 'user', content });
        
        set({ isLoading: true, error: null });
        try {
            const result = await auraService.chat({ message: content, project_id: projectId });
            get().addMessage(projectId, { role: 'aura', content: result.response });
        } catch (error: any) {
            console.error('Failed to send message to Aura:', error);
            set({ error: error.message || 'Une erreur est survenue.' });
            get().addMessage(projectId, { role: 'aura', content: "Désolé, je rencontre des difficultés techniques pour interroger les données du projet." });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchInsights: async (projectId: string) => {
        try {
            const insights = await auraService.getInsights(projectId);
            set({ insights });
        } catch (error) {
            console.error('Failed to fetch Aura insights:', error);
        }
    }
}));
