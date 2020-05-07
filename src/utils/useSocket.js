import { useEffect, useCallback, useRef } from "react";

export function useSocket(url, onMsg) {
  const socket = useRef();
  const msgHandler = useRef();
  msgHandler.current = onMsg;

  useEffect(() => {
    console.log('useEffect url change');

    const createdSocket = new WebSocket(url);

    createdSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      msgHandler.current(data);
    };

    socket.current = createdSocket;
    console.log("Create socket to ", url);

    return () => {
      console.log("Socket DISCONNECTED");
      createdSocket.close();
    };
  }, [url]);

  return useCallback((data) => {
    socket.current.send(JSON.stringify(data));
  }, []);
}
