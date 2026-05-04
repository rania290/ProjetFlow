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
    messages: ChatMessage[];
    insights: string[];
    isLoading: boolean;
    error: string | null;
    
    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    sendMessage: (content: string, projectId: string) => Promise<void>;
    fetchInsights: (projectId: string) => Promise<void>;
    clearMessages: () => void;
}

export const useAuraStore = create<AuraState>()((set, get) => ({
    isOpen: false,
    messages: [
        {
            id: 'welcome',
            role: 'aura',
            content: "Bonjour ! Je suis Aura, votre assistant IA de gestion de projet. Sélectionnez un projet actif et posez-moi vos questions !",
            timestamp: new Date()
        }
    ],
    insights: [],
    isLoading: false,
    error: null,

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
    
    addMessage: (msg) => set((state) => ({
        messages: [...state.messages, { ...msg, id: Math.random().toString(36).substring(7), timestamp: new Date() }]
    })),

    clearMessages: () => set({ 
        messages: [{
            id: 'welcome',
            role: 'aura',
            content: "Bonjour ! Je suis Aura, votre assistant IA de gestion de projet. Sélectionnez un projet actif et posez-moi vos questions !",
            timestamp: new Date()
        }] 
    }),

    sendMessage: async (content: string, projectId: string) => {
        get().addMessage({ role: 'user', content });
        
        set({ isLoading: true, error: null });
        try {
            const result = await auraService.chat({ message: content, project_id: projectId });
            get().addMessage({ role: 'aura', content: result.response });
        } catch (error: any) {
            console.error('Failed to send message to Aura:', error);
            set({ error: error.message || 'Une erreur est survenue.' });
            get().addMessage({ role: 'aura', content: "Désolé, je rencontre des difficultés techniques pour interroger les données du projet." });
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
