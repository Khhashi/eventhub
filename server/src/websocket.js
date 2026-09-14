import { WebSocketServer } from "ws"

let wss = null

export function initWebSocket(server) {
  wss = new WebSocketServer({ server })

  wss.on("connection", (socket) => {
    console.log("WebSocket client connected")

    socket.on("close", () => {
      console.log("WebSocket client disconnected")
    })
  })

  console.log("WebSocket server initialized")
}

export function broadcast(type, payload) {
  if (!wss) return

  const message = JSON.stringify({
    type,
    payload,
  })

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message)
    }
  })
}