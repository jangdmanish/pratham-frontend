"use client";
import { useEffect } from "react";
import { getSocket } from "@utils/socket";

export function useSocket<T>(
  event: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const socket = getSocket();

    // listen for event
    socket.on(event, callback);

    // cleanup on unmount or dependency change
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}
