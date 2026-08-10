import { useEffect, useState } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onopen = () => console.log('WebSocket connected');
    socket.send = () => console.log('Create message:');
    socket.onmessage = (event) => console.log('Received message:', event.data);
    socket.onclose = () => console.log('WebSocket disconnected');

    return () => socket.close();
  }, [url]);

  return ws;
}