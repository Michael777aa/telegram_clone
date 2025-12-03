import { useSelector } from "react-redux";
import { io } from "socket.io-client";

// Use environment variable
const SOCKET_URL = process.env.REACT_APP_WS_URL || "wss://telegram-server-1-o8qe.onrender.com";

// Create socket with proper configuration
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const useSocket = () => {
  const userId = useSelector((state) => state.userReducer.user._id);

  const socketEmit = (action, payload, fn) => {
    console.log("📤 Socket emit:", action, payload);
    socket.emit(action, payload, fn);
  };

  const socketListen = (action, fn) => {
    console.log("📥 Socket listen:", action);
    socket.on(action, fn);
  };

  // Remove listener
  const socketRemoveListener = (action, fn) => {
    socket.off(action, fn);
  };

  return { 
    socketEmit, 
    socketListen, 
    socketRemoveListener,
    userId, 
    socket,
    isConnected: socket.connected
  };
};

export default useSocket;