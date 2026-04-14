import { useEffect } from 'react';
import { socketService } from '../api/socket.service';
import type { AppNotification } from '../components/notifications/NotificationCenter';

interface UseSocketNotificationsOptions {
    token: string | null;
    onNotification: (notification: AppNotification) => void;
}

export function useSocketNotifications({ token, onNotification }: UseSocketNotificationsOptions) {
    useEffect(() => {
        if (!token) return;

        // Connect to the WebSocket
        socketService.connect(token);

        const handler = (data: AppNotification) => {
            onNotification(data);
        };

        socketService.on('notification', handler);

        return () => {
            socketService.off('notification', handler);
            socketService.disconnect();
        };
    }, [token, onNotification]);
}
