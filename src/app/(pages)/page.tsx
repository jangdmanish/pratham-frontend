"use client";
import Image from "next/image";
//import Button from "@components/button";
//import Input from "@components/input";
//import AutoResizeTextarea from "@components/autoresize-textarea";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@utils/socket";
import { useSocket } from "@app/hooks/useSocket";

interface ServerMessage {
  type: string;
  token: string;
}

interface Message {
  id:number|null;
  role:string;
  text:string;
}

export default function Home() {
  const socket = getSocket();
  const [queryByUser,setQueryByUser] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "assistant", text: "Hi — I\'m a ChatGPT-like assistant. Ask me anything!" }]);
  const listRef = useRef<HTMLDivElement>(null);
  const partialIdRef = useRef<number>(null);
    
  // Auto-scroll on new messages
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isThinking]);
  
  const handleServerResponse  = useCallback((args:ServerMessage) => {
    let token = null;
    try {
      const parsed = args;//JSON.parse(args);
      if (parsed.type === "token") {
        token = parsed.token;
        appendToPartial(token);
        //return;
      }
      else if (parsed.type === "done") {
          finalizePartial();
          //return;
      }
    } catch (e) {
      const errMsg = { id: Date.now() + Math.random(), role: "assistant", text: 'Sorry, something went wrong.' };
      setMessages((m) => [...m, errMsg]);
      console.error(errMsg);
      setIsThinking(false);
    }
  
  },[])

  useSocket("server_message",handleServerResponse);

  /*useEffect(() =>{
    const socket = getSocket();
    
    socket.on("server_message", (...args ) => {
      handleServerResponse(args.toString());
    });

    return () => {
      socket.off("message");
    };

  },[isThinking]);*/
  
  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  function onKeyDown(e:React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRequestToServer(e);
    }
  }

  const sendRequestToServer = (e:React.SyntheticEvent) => {
    e.preventDefault();
    const query = queryByUser.trim();
    if (!query) return;
    //if (!socket.connected) return
    let assistantId = Date.now() + Math.random();
    partialIdRef.current = assistantId;
    const clientMessage = {"id": assistantId,"role":"user","text":query };
    socket.emit("client_message", clientMessage);
    setMessages((m) => [...m, clientMessage]);
    setQueryByUser("");
    setIsThinking(true);
  };

  function appendToPartial(token: string) {
    setMessages((prev) => {
      const copy = prev.slice();
      const lastMessage = copy[copy.length-1];
      if (lastMessage.role === "user") {//first server message has appeared
        return [...copy, { "id": Date.now()+Math.random(), 'role': 'assistant', 'text': token }];
      } else{
        copy[copy.length-1] = { ...lastMessage, text: lastMessage.text + token };
        return copy;
      }
    });
  }

  function finalizePartial() {
    setIsThinking(false);
    partialIdRef.current = 0;
  }

  function cancelStreaming() {
    // Optionally append a message that streaming was canceled
    if (partialIdRef.current) {
      setMessages((m) => m.map(msg => msg.id === partialIdRef.current ? { ...msg, text: msg.text + "[Stopped]" } : msg));
    }
  }

  return (
      <div className="flex min-h-screen w-full justify center bg-gray-50">
        <div className="flex flex-col min-h-screen max-w-3xl w-3xl mx-auto justify-center">
          {/* Header */}
          <header className="flex items-center gap-3 p-4 border-b">
            <div className="w-30 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold">Pratham AI</div>
            <div className="ml-auto text-sm text-gray-400">Model: <span className="font-medium text-gray-700">gpt-clone</span></div>
          </header>

          {/* Messages List */}
          <div ref={listRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-white to-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg break-words whitespace-pre-wrap shadow-sm ${
                  m.role === "user" ? "bg-indigo-600 text-white rounded-br-2xl rounded-tl-md" : "bg-gray-100 text-gray-800 rounded-bl-2xl rounded-tr-md"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[60%] px-4 py-2 rounded-lg bg-blue-500 text-white shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <footer>
            <form onSubmit={(e)=> sendRequestToServer(e)} className="p-4 border-t">
              <div className="flex gap-3">
                <textarea
                  value={queryByUser}
                  onChange={(e) => setQueryByUser(e.target.value)}
                  onKeyDown={(e)=>onKeyDown(e)}
                  placeholder="Type your message — Enter to send, Shift+Enter for newline"
                  className="flex-1 min-h-[48px] max-h-40 resize-none p-3 rounded-lg border border-gray-500 text-gray-800 focus:outline-none focus:border-blue-500 focus:text-blue-700"
                />
                <div className="flex flex-col gap-2">
                  <button type ='submit' className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:opacity-95">
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([
                        { id: Date.now(), role: "assistant", text: "Hi — I\'m a Pratham assistant. Ask me anything!" },
                      ]);
                    }}
                    className="px-3 py-1 rounded-lg border text-sm text-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </footer>
        </div>
      </div>
  );

  function TypingDots() {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full animate-bounce" />
        <span className="inline-block w-2 h-2 rounded-full animate-bounce animation-delay-200" />
        <span className="inline-block w-2 h-2 rounded-full animate-bounce animation-delay-400" />
        <style jsx>{`
          .animate-bounce { animation: bounce 1s infinite; }
          .animation-delay-200 { animation-delay: 0.15s }
          .animation-delay-400 { animation-delay: 0.3s }
          @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6 } 40% { transform: translateY(-6px); opacity: 1 } }
        `}</style>
      </div>
    );
  }
}
