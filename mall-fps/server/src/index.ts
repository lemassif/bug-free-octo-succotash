import http from "node:http";
import express from "express";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { TdmRoom } from "./rooms/TdmRoom.ts";

const PORT = Number(process.env.PORT ?? 2567);

const app = express();
app.get("/health", (_req, res) => {
  res.json({ ok: true, game: "black-friday-brawl" });
});

const server = http.createServer(app);
const gameServer = new Server({ transport: new WebSocketTransport({ server, pingInterval: 5000 }) });
// Rooms without bots (bots: false) are kept apart from normal 7v7 rooms.
gameServer.define("tdm", TdmRoom).filterBy(["bots"]);

await gameServer.listen(PORT);
console.log(`Black Friday Brawl server listening on :${PORT}`);
