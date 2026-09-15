import { io } from "socket.io-client"

const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin

export const createSocket = () =>
  io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  })