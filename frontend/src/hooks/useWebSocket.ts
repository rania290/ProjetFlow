import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: 'NOTIFICATION' | 'TASK_UPDATE' | 'PROJECT_UPDATE' | 'MESSAGE';
  data: any;
  timestamp: number;
}

interface NotificationData {
  id: string;
  type: 'TASK_ASSIGNED' | 'PROJECT_UPDATED' | 'MESSAGE' | 'REMINDER' | 'TASK_COMPLETED' | 'TASK_DUE_SOON';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  senderId?: string;
  senderName?: string;
  createdAt: string;
  read: boolean;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // 1 seconde

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Envoyer le token d'authentification
        const token = localStorage.getItem('token');
        if (token) {
          ws.current?.send(JSON.stringify({
            type: 'AUTH',
            token
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Gérer les différents types de messages
          switch (message.type) {
            case 'NOTIFICATION':
              handleNotification(message.data);
              break;
            case 'TASK_UPDATE':
              handleTaskUpdate(message.data);
              break;
            case 'PROJECT_UPDATE':
              handleProjectUpdate(message.data);
              break;
            case 'MESSAGE':
              handleMessage(message.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Tentative de reconnexion automatique
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeout.current = window.setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, reconnectDelay * Math.pow(2, reconnectAttempts.current)); // Exponential backoff
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      window.clearTimeout(reconnectTimeout.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const handleNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Afficher une notification navigateur si permission accordée
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const handleTaskUpdate = (data: any) => {
    // Émettre un événement personnalisé pour les mises à jour de tâches
    window.dispatchEvent(new CustomEvent('taskUpdate', { detail: data }));
  };

  const handleProjectUpdate = (data: any) => {
    // Émettre un événement personnalisé pour les mises à jour de projet
    window.dispatchEvent(new CustomEvent('projectUpdate', { detail: data }));
  };

  const handleMessage = (data: any) => {
    // Émettre un événement personnalisé pour les messages
    window.dispatchEvent(new CustomEvent('newMessage', { detail: data }));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    
    // Envoyer au serveur que la notification a été lue
    sendMessage({
      type: 'MARK_NOTIFICATION_READ',
      notificationId
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    sendMessage({ type: 'CLEAR_NOTIFICATIONS' });
  };

  useEffect(() => {
    // Demander la permission pour les notifications navigateur
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    connect();

    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    lastMessage,
    notifications,
    sendMessage,
    markNotificationAsRead,
    clearNotifications,
    reconnect: connect,
    disconnect
  };
};

// Hook pour écouter les événements WebSocket
export const useWebSocketEvents = () => {
  const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      setTaskUpdates(prev => [event.detail, ...prev.slice(0, 49)]); // Garder seulement les 50 derniers
    };

    const handleProjectUpdate = (event: CustomEvent) => {
      setProjectUpdates(prev => [event.detail, ...prev.slice(0, 49)]);
    };

    const handleNewMessage = (event: CustomEvent) => {
      setMessages(prev => [event.detail, ...prev.slice(0, 49)]);
    };

    window.addEventListener('taskUpdate', handleTaskUpdate as EventListener);
    window.addEventListener('projectUpdate', handleProjectUpdate as EventListener);
    window.addEventListener('newMessage', handleNewMessage as EventListener);

    return () => {
      window.removeEventListener('taskUpdate', handleTaskUpdate as EventListener);
      window.removeEventListener('projectUpdate', handleProjectUpdate as EventListener);
      window.removeEventListener('newMessage', handleNewMessage as EventListener);
    };
  }, []);

  return {
    taskUpdates,
    projectUpdates,
    messages,
    clearTaskUpdates: () => setTaskUpdates([]),
    clearProjectUpdates: () => setProjectUpdates([]),
    clearMessages: () => setMessages([])
  };
};
