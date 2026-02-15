// ws/yws-server.js - Real-time collaboration WebSocket server
const WebSocket = require("ws");

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/ws/collab" });

  // roomId -> Map<ws, { id, username }>
  const rooms = new Map();

  // roomId -> { content, version }
  const documents = new Map();

  wss.on("connection", (ws) => {
    let currentRoom = null;
    let userInfo = { id: "anon", username: "anonymous" };

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);

        switch (msg.type) {
          /* ---- JOIN ---- */
          case "join": {
            // Client sends: { type:"join", room, user:{ id, username } }
            // OR legacy:    { type:"join", repoId, fileId, username }
            const roomId =
              msg.room || `${msg.repoId || "r"}:${msg.fileId || "f"}`;
            currentRoom = roomId;
            userInfo = msg.user || {
              id: msg.username || "anon",
              username: msg.username || "anonymous",
            };

            if (!rooms.has(roomId)) rooms.set(roomId, new Map());
            rooms.get(roomId).set(ws, userInfo);

            // Send document state if it exists
            if (documents.has(roomId)) {
              ws.send(
                JSON.stringify({
                  type: "sync",
                  content: documents.get(roomId).content,
                  version: documents.get(roomId).version,
                }),
              );
            }

            // Notify others about new user
            broadcastToRoom(
              roomId,
              {
                type: "user_joined",
                user: userInfo,
              },
              ws,
            );

            // Send full user list to the joining client
            ws.send(
              JSON.stringify({
                type: "users",
                users: getUserList(roomId),
              }),
            );

            break;
          }

          /* ---- EDIT ---- */
          case "edit": {
            if (!currentRoom) break;

            documents.set(currentRoom, {
              content: msg.content,
              version: (documents.get(currentRoom)?.version || 0) + 1,
            });

            broadcastToRoom(
              currentRoom,
              {
                type: "edit",
                content: msg.content,
                version: documents.get(currentRoom).version,
                user: userInfo,
              },
              ws,
            );

            break;
          }

          /* ---- CURSOR ---- */
          case "cursor": {
            if (!currentRoom) break;
            broadcastToRoom(
              currentRoom,
              {
                type: "cursor",
                user: userInfo,
                cursorPos: msg.cursorPos,
                selection: msg.selection,
              },
              ws,
            );
            break;
          }

          /* ---- CHAT ---- */
          case "chat": {
            if (!currentRoom) break;
            const chatPayload = {
              type: "chat",
              user: userInfo,
              message: msg.message || "",
              timestamp: Date.now(),
            };
            // Broadcast to everyone in room including sender
            broadcastToRoom(currentRoom, chatPayload);
            break;
          }
        }
      } catch (err) {
        console.error("WS message error:", err);
      }
    });

    ws.on("close", () => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(ws);

        broadcastToRoom(currentRoom, {
          type: "user_left",
          userId: userInfo.id,
          username: userInfo.username,
          users: getUserList(currentRoom),
        });

        if (rooms.get(currentRoom).size === 0) {
          rooms.delete(currentRoom);
        }
      }
    });

    ws.on("error", (err) => console.error("WS error:", err));
  });

  /* ---- helpers ---- */
  function broadcastToRoom(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    const data = JSON.stringify(message);
    room.forEach((_, client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  function getUserList(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    const users = [];
    const seen = new Set();
    room.forEach((info) => {
      if (!seen.has(info.id)) {
        seen.add(info.id);
        users.push({ id: info.id, username: info.username });
      }
    });
    return users;
  }

  console.log("WebSocket collaboration server ready on /ws/collab");
  return wss;
}

module.exports = setupWebSocket;
