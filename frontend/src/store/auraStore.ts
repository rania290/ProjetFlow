import { create } from 'zustand';
import { auraService } from '../api/aura.service';

export interface ChatMessage {
    id: string;
    role: 'user' | 'aura';
    content: string;
    timestamp: Date;
}

export interface AuraConversation {
    id: string;
    title: string;
    project_id?: string;
    created_at: string;
    updated_at: string;
}

interface AuraState {
    isOpen: boolean;
    messagesByProject: Record<string, ChatMessage[]>;
    conversations: AuraConversation[];
    activeConversationId: string | null;
    insights: string[];
    isLoading: boolean;
    error: string | null;
    
    toggleOpen: () => void;
    setOpen: (isOpen: boolean) => void;
    fetchConversations: (projectId: string) => Promise<void>;
    selectConversation: (conversationId: string) => Promise<void>;
    startNewConversation: (projectId: string) => void;
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
    conversations: [],
    activeConversationId: null,
    insights: [],
    isLoading: false,
    error: null,

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
    
    fetchConversations: async (projectId: string) => {
        try {
            const convs = await auraService.getConversations(projectId);
            set({ conversations: convs });
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    },

    selectConversation: async (conversationId: string) => {
        set({ activeConversationId: conversationId, isLoading: true });
        try {
            const messages = await auraService.getConversationMessages(conversationId);
            const formattedMessages: ChatMessage[] = messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at)
            }));
            
            // We need to know which project this conversation belongs to. 
            // For now we assume the current project, but ideally it should be in the response.
            const currentProjectConv = get().conversations.find(c => c.id === conversationId);
            if (currentProjectConv) {
                 set((state) => ({
                    messagesByProject: {
                        ...state.messagesByProject,
                        [currentProjectConv.project_id || 'default']: formattedMessages
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to load conversation messages', error);
        } finally {
            set({ isLoading: false });
        }
    },

    startNewConversation: (projectId: string) => {
        set({ activeConversationId: null });
        get().clearMessages(projectId);
    },

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
            const result = await auraService.chat({ 
                message: content, 
                project_id: projectId,
                conversation_id: get().activeConversationId || undefined
            });
            
            get().addMessage(projectId, { role: 'aura', content: result.response });
            
            if (!get().activeConversationId) {
                set({ activeConversationId: result.conversation_id });
                get().fetchConversations(projectId);
            }
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
