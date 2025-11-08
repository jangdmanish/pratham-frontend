"use client";
import Image from "next/image";
//import Button from "@components/button";
//import Input from "@components/input";
import { io } from "socket.io-client";
//import AutoResizeTextarea from "@components/autoresize-textarea";
import React, { useEffect, useRef, useState } from "react";
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("Socket connected : " + socket.id);
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});

export default function Home() {
  const [queryByUser,setQueryByUser] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi — I\'m a ChatGPT-like assistant. Ask me anything!" }]);
  const listRef = useRef<HTMLDivElement>(null);
    
  // Auto-scroll on new messages
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isThinking]);

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  function onKeyDown(e:React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRequestToServer();
    }
  }

  const sendRequestToServer = (): void => {
    const query = queryByUser.trim();
    if (!query) return;
    const userMessage = { id: Date.now() + Math.random(), role: "user", text:query };
    socket.emit("client_message",query);
    setMessages((m) => [...m, userMessage]);
    setQueryByUser("");
    setIsThinking(true);
  };

  socket.on("server_message", (...args ) => {
    try {
      console.log("Received message from server: " + args); 
      const receivedMessage = { id: Date.now() + Math.random(), role: "server", text : args.toString() };
      setMessages((m) => [...m, receivedMessage]);
    } catch (err){
      const errMsg = { id: Date.now() + Math.random(), role: "server", text: 'Sorry, something went wrong.' };
      setMessages((m) => [...m, errMsg]);
      //console.error(err);
    } finally{
      setIsThinking(false);
    }
  });

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
                <div className="max-w-[60%] px-4 py-2 rounded-lg bg-gray-100 text-gray-500 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <footer>
            <form onSubmit={sendRequestToServer} className="p-4 border-t">
              <div className="flex gap-3">
                <textarea
                  value={queryByUser}
                  onChange={(e) => setQueryByUser(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message — Enter to send, Shift+Enter for newline"
                  className="flex-1 min-h-[48px] max-h-40 resize-none p-3 rounded-lg border border-gray-500 text-gray-800 focus:outline-none focus:border-blue-500 focus:text-blue-700"
                />
                <div className="flex flex-col gap-2">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-sm hover:opacity-95">
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
