import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/api/socket.service';
import { communicationApi } from '@/api/communication.service';
import type { ChatMessage } from '@/api/communication.service';
import { useAuth } from '@/hooks/useAuth';

export const useChat = (projectId: string | null) => {
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ id: string, name: string }[]>([]);
    
    // Track local typing state to avoid repeated emissions
    const [localIsTyping, setLocalIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    // 1. Initial Load (History)
    useEffect(() => {
        if (!projectId) return;

        const loadHistory = async () => {
            setIsLoading(true);
            try {
                const history = await communicationApi.getProjectMessages(projectId);
                console.log(`[Chat] Loaded ${history.length} messages for project ${projectId}`);
                setMessages(history);
            } catch (error) {
                console.error('[Chat] Failed to load chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [projectId]);

    // 2. WebSocket Connection
    useEffect(() => {
        if (!projectId || !token || !user?.id) {
            console.warn('[Chat] No projectId, token or userId, skipping socket connection');
            return;
        }

        console.log(`[Chat] Connecting to socket for project ${projectId}`);
        const chatSocket = socketService.connect(token, 'chat', { 
            projectId, 
            userId: user?.id || '' 
        });

        const onConnect = () => {
            console.log('[Chat] Socket connected, joining room for project:', projectId);
            setIsConnected(true);
            chatSocket.emit('joinProject', projectId);
        };

        const onDisconnect = (reason: string) => {
            console.warn('[Chat] Socket disconnected:', reason);
            setIsConnected(false);
            setOnlineUsers([]);
        };

        const onNewMessage = (msg: ChatMessage) => {
            console.log('[Chat] Received newMessage event:', msg);
            if (msg.projectId === projectId) {
                setMessages(prev => {
                    const withoutTemp = prev.filter(m =>
                        !(m.id.startsWith('temp_') && m.authorId === msg.authorId && m.content === msg.content)
                    );
                    const alreadyExists = withoutTemp.some(m => m.id === msg.id);
                    return alreadyExists ? withoutTemp : [...withoutTemp, msg];
                });
            }
        };

        const onMessageUpdated = (updatedMsg: ChatMessage) => {
            console.log('[Chat] Received messageUpdated event:', updatedMsg);
            if (updatedMsg.projectId === projectId) {
                setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
            }
        };

        const onPresenceUpdate = (userIds: string[]) => {
            console.log('[Chat] Received presenceUpdate:', userIds);
            setOnlineUsers(userIds);
        };

        const onUserTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
            if (data.userId === user?.id) return;
            
            setTypingUsers(prev => {
                const others = prev.filter(u => u.id !== data.userId);
                if (data.isTyping) {
                    return [...others, { id: data.userId, name: data.userName }];
                }
                return others;
            });
        };

        const onError = (err: Error) => {
            console.error('[Chat] Socket error:', err.message);
        };

        chatSocket.on('connect', onConnect);
        chatSocket.on('disconnect', onDisconnect);
        chatSocket.on('newMessage', onNewMessage);
        chatSocket.on('messageUpdated', onMessageUpdated);
        chatSocket.on('presenceUpdate', onPresenceUpdate);
        chatSocket.on('userTyping', onUserTyping);
        chatSocket.on('connect_error', onError);

        if (chatSocket.connected) {
            console.log('[Chat] Socket already connected, joining room immediately');
            setIsConnected(true);
            chatSocket.emit('joinProject', projectId);
        }

        return () => {
            console.log('[Chat] Cleaning up socket listeners for project:', projectId);
            chatSocket.off('connect', onConnect);
            chatSocket.off('disconnect', onDisconnect);
            chatSocket.off('newMessage', onNewMessage);
            chatSocket.off('messageUpdated', onMessageUpdated);
            chatSocket.off('presenceUpdate', onPresenceUpdate);
            chatSocket.off('userTyping', onUserTyping);
            chatSocket.off('connect_error', onError);
        };
    }, [projectId, token, user?.id]);

    // 3. typing notification with debounce
    const sendTypingStatus = useCallback((isTyping: boolean) => {
        if (!projectId || !user || !isConnected) return;
        
        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) {
            console.log(`[Chat] Sending typing status: ${isTyping} for user ${user.fullName}`);
            chatSocket.emit('typing', { 
                projectId, 
                userId: user.id, 
                userName: user.fullName || 'Un membre',
                isTyping 
            });
        }
    }, [projectId, user, isConnected]);

    const handleLocalTyping = useCallback(() => {
        if (!localIsTyping) {
            setLocalIsTyping(true);
            sendTypingStatus(true);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            setLocalIsTyping(false);
            sendTypingStatus(false);
        }, 3000);
    }, [localIsTyping, sendTypingStatus]);

    // 4. Send Message — with OPTIMISTIC UPDATE
    const sendMessage = useCallback((content: string, mentions: string[] = []): boolean => {
        if (!projectId || !user) {
            console.error('[Chat] Cannot send: no projectId or user');
            return false;
        }

        const tempId = `temp_${Date.now()}`;
        const payload: any = {
            projectId,
            authorId: user.id || 'anonymous',
            authorName: user.fullName || 'Anonymous',
            authorAvatar: user.profilePhoto,
            content,
            mentions,
        };

        if (replyTo) {
            payload.replyTo = {
                id: replyTo.id,
                authorName: replyTo.authorName,
                content: replyTo.content.substring(0, 100) + (replyTo.content.length > 100 ? '...' : ''),
            };
        }

        const optimisticMsg: ChatMessage = {
            id: tempId,
            projectId,
            authorId: user.id || 'anonymous',
            authorName: user.fullName || 'Anonymous',
            authorAvatar: user.profilePhoto,
            content,
            mentions,
            likes: [],
            isPinned: false,
            replyTo: replyTo
                ? { id: replyTo.id, authorName: replyTo.authorName, content: replyTo.content.substring(0, 100) }
                : undefined,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setReplyTo(null);

        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) {
            chatSocket.emit('sendMessage', payload);
        } else {
            communicationApi.sendMessage(payload)
                .then((savedMsg) => {
                    setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
                })
                .catch((err) => {
                    setMessages(prev => prev.filter(m => m.id !== tempId));
                    return false;
                });
        }

        return true;
    }, [projectId, user, replyTo]);

    // 4. Actions
    const toggleLike = useCallback((messageId: string) => {
        if (!user) return;
        setMessages(prev => prev.map(m => {
            if (m.id === messageId) {
                const currentLikes = m.likes || [];
                const hasLiked = currentLikes.includes(user.id || '');
                return {
                    ...m,
                    likes: hasLiked 
                        ? currentLikes.filter(id => id !== user.id)
                        : [...currentLikes, user.id || '']
                };
            }
            return m;
        }));

        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) {
            chatSocket.emit('likeMessage', { messageId, userId: user.id });
        }
    }, [user]);

    const togglePin = useCallback((messageId: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) chatSocket.emit('pinMessage', { messageId });
    }, []);

    const editMessage = useCallback((messageId: string, text: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: text, isEdited: true } : m));
        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) chatSocket.emit('editMessage', { messageId, text });
    }, []);

    const deleteMessage = useCallback((messageId: string) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, content: '<p><em class="text-slate-400">Ce message a été supprimé.</em></p>' } : m));
        const chatSocket = socketService.getSocket('chat');
        if (chatSocket?.connected) chatSocket.emit('deleteMessage', { messageId });
    }, []);

    return {
        messages,
        isLoading,
        isConnected,
        onlineUsers,
        typingUsers,
        replyTo,
        setReplyTo,
        handleLocalTyping,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleLike,
        togglePin,
    };
};
