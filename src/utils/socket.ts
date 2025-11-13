import { io, Socket } from "socket.io-client";

//let socket: Socket | null = null;

export default class SocketManager {
  private static instance : SocketManager;
  private socket:Socket;

  private constructor (){
    this.socket = io("http://localhost:8080", {
      transports: ["websocket"], // avoid polling
    });
  }

  public static getInstance() : SocketManager{
    if(!SocketManager.instance){
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public getSocket = () =>{
    return this.socket;
  }
}
