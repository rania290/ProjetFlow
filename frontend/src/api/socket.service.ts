import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

// The WebSocket chat gateway runs on the communication-service directly (port 3006)
// It cannot be proxied through the API Gateway's HTTP proxy layer
const CHAT_SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || 'http://localhost:3006';

const getSocketBaseUrl = (namespace: string): string => {
    if (namespace === 'chat') return CHAT_SOCKET_URL;
    return SOCKET_URL;
};

class SocketService {
    private sockets: Map<string, Socket> = new Map();

    connect(token: string, namespace: string = 'notifications', query: Record<string, string> = {}): Socket {
        const existing = this.sockets.get(namespace);

        // Detect if query parameters have changed
        const queryChanged = existing && JSON.stringify(existing.io.opts.query) !== JSON.stringify(query);

        if (existing) {
            if (existing.connected && !queryChanged) {
                return existing;
            }
            // Socket exists but is disconnected or query changed — clean it up before reconnecting
            console.log(`[Socket] Cleaning up ${namespace} because ${queryChanged ? 'query changed' : 'socket disconnected'}`);
            existing.removeAllListeners();
            existing.disconnect();
            this.sockets.delete(namespace);
        }

        const baseUrl = getSocketBaseUrl(namespace);
        const nsp = namespace.startsWith('/') ? namespace : `/${namespace}`;

        console.log(`[Socket] Initializing connection to ${baseUrl}${nsp} (Transports: polling, websocket)`);

        const socket = io(`${baseUrl}${nsp}`, {
            auth: { token },
            query,
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socket.on('connect', () => {
            console.log(`[Socket] Connected to ${namespace}:`, socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Disconnected from ${namespace}:`, reason);
        });

        socket.on('connect_error', (err) => {
            console.error(`[Socket] Connection error on ${namespace}:`, err.message);
        });

        this.sockets.set(namespace, socket);
        return socket;
    }

    disconnect(namespace?: string): void {
        if (namespace) {
            const socket = this.sockets.get(namespace);
            if (socket) {
                socket.disconnect();
                this.sockets.delete(namespace);
            }
        } else {
            this.sockets.forEach((socket, ns) => {
                socket.disconnect();
            });
            this.sockets.clear();
        }
    }

    getSocket(namespace: string = 'notifications'): Socket | null {
        return this.sockets.get(namespace) ?? null;
    }

    isConnected(namespace: string = 'notifications'): boolean {
        return this.sockets.get(namespace)?.connected ?? false;
    }

    emit(namespace: string, event: string, data?: any): void {
        this.sockets.get(namespace)?.emit(event, data);
    }

    // Backward compatibility for default namespace (notifications)
    on(event: string, callback: (data: any) => void): void {
        const socket = this.sockets.get('notifications');
        if (socket) {
            socket.on(event, callback);
        } else {
            console.warn(`[Socket] Attempted to listen to event "${event}" on "notifications" but it's not connected.`);
        }
    }

    off(event: string, callback?: (data: any) => void): void {
        const socket = this.sockets.get('notifications');
        if (socket) {
            socket.off(event, callback);
        }
    }
}

// Singleton
export const socketService = new SocketService();
