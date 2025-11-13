"use client";
import { useEffect } from "react";
import SocketManager from "@utils/socket";

export function useSocket<T>(
  event: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const socket = SocketManager.getInstance().getSocket();

    // listen for event
    socket.on(event, callback);

    // cleanup on unmount or dependency change
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}
