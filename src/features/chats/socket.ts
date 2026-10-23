import { io, type Socket } from "socket.io-client"
import { WS_URL } from "../../util/constants"

let chatSocket: Socket | null = null

/**
 * The single chat socket for the app, created on first call.
 *
 * Call this only from browser code (effects and event handlers) — never at
 * module scope or during render — so importing the chat components stays free
 * of side effects and safe to evaluate on a server.
 *
 * `autoConnect` is off; `useChatSocket` connects it while the user is
 * authenticated.
 */
export function getChatSocket(): Socket {
  if (!chatSocket) {
    chatSocket = io(WS_URL, {
      withCredentials: true,
      path: "/ws",
      reconnectionDelay: 4000,
      autoConnect: false,
      secure: true,
      transports: ["websocket", "polling", "xhr-polling"],
    })
  }
  return chatSocket
}
