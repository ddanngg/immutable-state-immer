import { Server as WebSocketServer } from "ws";

import gifts from "./misc/gifts.json";
import { produceWithPatches, applyPatches, enablePatches } from "immer";

enablePatches();

const initialState = { gifts };

const wss = new WebSocketServer({ port: 5001 });

const connections = [];

let history = [];

wss.on("connection", (ws) => {
  console.log("new connection");
  connections.push(ws);

  ws.on("message", (msg) => {
    console.log(msg);

    // append all the patches
    history.push(...JSON.parse(msg));

    // send `msg` to rest client
    connections
      .filter((client) => client !== ws)
      .forEach((client) => {
        client.send(msg);
      });
  });

  ws.on("close", () => {
    const idx = connections.indexOf(ws);
    if (idx !== -1) connections.splice(idx, -1);
  });

  ws.send(JSON.stringify(history));
});

function compressHistory(currentPatches) {
  const [, patches] = produceWithPatches(initialState, (draft) => {
    return applyPatches(draft, currentPatches);
  });
  console.log(`[COMPRESS] from ${currentPatches.length} to ${patches.length}`);
  return patches;
}

setInterval(() => {
  history = compressHistory(history);
}, 5000);
