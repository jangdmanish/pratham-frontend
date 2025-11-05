"use client";
import Image from "next/image";
import Button from "@components/button";
import Input from "@components/input";
import { useState } from "react";
import { io } from "socket.io-client";
import AutoResizeTextarea from "@components/autoresize-textarea";

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("Socket connected : " + socket.id);
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});

socket.on("server_message", (...args) => {
  console.log("Received message from server: " + args); 
});

export default function Home() {
  const [queryByUser,setQueryByUser] = useState("");
  const [serverResponse,setServerResponse] = useState("");

  const sendServerRequest = (): void => {
    if (!queryByUser) return;
      socket.emit("client_message",queryByUser);
      setQueryByUser("");
  };

  socket.on("server_message", (...args) => {
    console.log("Received message from server: " + args); 
    setServerResponse(serverResponse + " "+ args);
  });

  return (
      <main className="flex flex-col min-h-screen w-full items-center justify-center py-16 px-16 bg-white">
        <div className="flex flex-col max-w-2xl gap-6 items-center">
          <Image
              src="/logo.png"
              alt="Next.js logo"
              width={100}
              height={100}
              className="mb-8"
          />
          <div className="flex flex-col items-center gap-6">
            <AutoResizeTextarea disabled={true} value={serverResponse} />
            <Input name="queryByUser" value={queryByUser} placeholder="Hey!! let me answer for you" onChange={(e)=>setQueryByUser(e.target.value)}></Input>
            <Button text="Get an answer" onClick={sendServerRequest}></Button>
          </div>
        </div>  
      </main>
  );
}
